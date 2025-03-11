class ItemComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const itemId = this.getAttribute("item-id");
    const itemName = this.getAttribute("item-name");
    const itemDesc = this.getAttribute("item-desc");

    // Create container element
    const container = document.createElement("div");
    container.classList.add("item");

    // Create an element to display item details
    const details = document.createElement("span");
    details.textContent = `${itemName} (ID: ${itemId}) - Description: ${itemDesc}`;
    details.classList.add("item-details");
    container.appendChild(details);

    // Edit button: opens the edit popup
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () =>
      this.openEditPopup(itemId, itemName, itemDesc)
    );
    container.appendChild(editBtn);

    // Delete button: prompts a confirm dialog
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => this.deleteItem(itemId));
    container.appendChild(deleteBtn);

    this.shadowRoot.appendChild(container);

    // Append styling to the shadow DOM
    const style = document.createElement("style");
    style.textContent = `
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
      .popup-content input {
        padding: 5px;
        font-size: 16px;
      }
      .popup-content button {
        padding: 8px;
        cursor: pointer;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  async deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Remove this element from the DOM without refreshing.
          this.remove();
        } else {
          alert("Failed to delete item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  }

  openEditPopup(itemId, currentName, currentDesc) {
    // Create the popup
    const popup = document.createElement("div");
    popup.classList.add("edit-popup");
    popup.innerHTML = `
      <div class="popup-content">
        <h3>Edit Item</h3>
        <label for="edit-name">Name:</label>
        <input type="text" id="edit-name" value="${currentName}">
        <label for="edit-desc">Description:</label>
        <input type="text" id="edit-desc" value="${currentDesc}">
        <button id="save-edit">Save</button>
        <button id="cancel-edit">Cancel</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Popup styles (appended to head)
    const style = document.createElement("style");
    style.textContent = `
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
      .popup-content input {
        padding: 5px;
        font-size: 16px;
      }
      .popup-content button {
        padding: 8px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    // Cancel editing: simply remove the popup.
    popup.querySelector("#cancel-edit").addEventListener("click", () => {
      popup.remove();
    });

    // Save edits and send PUT request with correct keys
    popup.querySelector("#save-edit").addEventListener("click", async () => {
      const updatedName = popup.querySelector("#edit-name").value;
      const updatedDesc = popup.querySelector("#edit-desc").value;

      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_name: updatedName,
            description: updatedDesc,
          }),
        });
        if (response.ok) {
          popup.remove();
          if (typeof window.fetchItems === "function") {
            window.fetchItems();
          }
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

// Fetch and display items without refreshing the page.
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
    // Expose fetchItems globally so it can be called from openEditPopup
  window.fetchItems = fetchItems;
  // Handle adding new items: update the list after a successful addition.
  const addItemForm = document.getElementById("add-item-form");
  addItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(addItemForm);
    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        fetchItems();
      } else {
        alert("Failed to add item.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  });

  // Initial fetch of items on page load.
  fetchItems();
});

