class ItemComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const itemId = this.getAttribute("item-id");
    const itemName = this.getAttribute("item-name");
    const itemDesc = this.getAttribute("item-desc");

    const itemContainer = document.createElement("div");
    itemContainer.classList.add("item");

    const itemTitle = document.createElement("span");
    itemTitle.textContent = `${itemName} (ID: ${itemId}) - Description: ${itemDesc}`;
    itemContainer.appendChild(itemTitle);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => this.openEditPopup(itemId, itemName, itemDesc));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => this.deleteItem(itemId));

    itemContainer.appendChild(editButton);
    itemContainer.appendChild(deleteButton);

    this.shadowRoot.appendChild(itemContainer);

    const styles = document.createElement("style");
    styles.innerHTML = `
      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 10px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 5px;
        width: 100%;
      }
      button {
        margin-left: 10px;
        padding: 5px 10px;
        cursor: pointer;
      }
      button:hover {
        background-color: #ccc;
      }
    `;
    this.shadowRoot.appendChild(styles);
  }

  async deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert(`Item with ID ${itemId} deleted successfully.`);
          window.location.reload();
        } else {
          alert("Failed to delete item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  }

  openEditPopup(itemId, itemName, itemDesc) {
    // Create the popup
    const popup = document.createElement("div");
    popup.classList.add("edit-popup");

    popup.innerHTML = `
      <div class="popup-content">
        <h3>Edit Item</h3>
        <label>Name:</label>
        <input type="text" id="edit-name" value="${itemName}">
        <label>Description:</label>
        <input type="text" id="edit-desc" value="${itemDesc}">
        <button id="save-edit">Save</button>
        <button id="cancel-edit">Cancel</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Style the popup
    const style = document.createElement("style");
    style.innerHTML = `
      .edit-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }
      .popup-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      input {
        padding: 5px;
        font-size: 16px;
      }
      button {
        padding: 8px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    // Handle cancel button
    document.getElementById("cancel-edit").addEventListener("click", () => {
      popup.remove();
    });

    // Handle save button
    document.getElementById("save-edit").addEventListener("click", async () => {
      const updatedName = document.getElementById("edit-name").value;
      const updatedDesc = document.getElementById("edit-desc").value;

      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_name: updatedName, item_desc: updatedDesc }),
        });

        if (response.ok) {
          alert("Item updated successfully!");
          popup.remove();
          window.location.reload(); // Refresh the page to reflect changes
        } else {
          alert("Failed to update item.");
        }
      } catch (error) {
        console.error("Error updating item:", error);
      }
    });
  }
}

customElements.define("item-component", ItemComponent);

document.addEventListener("DOMContentLoaded", async () => {
  const itemsContainer = document.getElementById("inventory");

  async function fetchItems() {
    try {
      const response = await fetch("/api/wardrobe/items");
      if (!response.ok) throw new Error("Failed to fetch items");

      const items = await response.json();
      itemsContainer.innerHTML = ""; // Clear previous content

      items.forEach((item) => {
        const itemElem = document.createElement("item-component");
        itemElem.setAttribute("item-id", item.id);
        itemElem.setAttribute("item-name", item.item_name);
        itemElem.setAttribute("item-desc", item.item_desc);
        itemsContainer.appendChild(itemElem);
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  document.getElementById("add-item-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchItems(); // Refresh list
      } else {
        alert("Failed to add item.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  });

  fetchItems(); // Initial fetch on page load
});
