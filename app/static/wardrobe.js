class ItemComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const itemId = this.getAttribute("item-id");
    const itemName = this.getAttribute("item-name");
    const itemDesc = this.getAttribute("item-desc");

    // Main container for the item tile
    const container = document.createElement("div");
    container.classList.add("item");

    // Details container: contains item name and description
    const details = document.createElement("div");
    details.classList.add("item-details");

    const nameElem = document.createElement("p");
    nameElem.textContent = itemName;
    nameElem.classList.add("item-name");

    const descElem = document.createElement("p");
    descElem.textContent = itemDesc;
    descElem.classList.add("item-desc");

    details.appendChild(nameElem);
    details.appendChild(descElem);

    // Actions container: holds edit and delete buttons in their own row (below the text)
    const actions = document.createElement("div");
    actions.classList.add("item-actions");

    // Edit button (aligned left)
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () =>
      this.openEditPopup(itemId, itemName, itemDesc)
    );

    // Delete button (aligned right)
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => this.deleteItem(itemId));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Append details and then the actions container (so actions are below details)
    container.appendChild(details);
    container.appendChild(actions);

    this.shadowRoot.appendChild(container);

    // Styles for the component
    const style = document.createElement("style");
    style.textContent = `
      .item {
        width: 300px;
        background-color: #f0f0f0;
        border-radius: 5px;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .item-details {
        margin-bottom: 10px;
      }
      .item-name {
        font-weight: bold;
        margin: 0;
      }
      .item-desc {
        margin: 5px 0 0 0;
        color: #666;
      }
      .item-actions {
        display: flex;
        justify-content: space-between;
      }
      .item-actions button {
        padding: 5px 10px;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      .edit-btn {
        background-color: #e0e0e0;
        color: #333;
      }
      .edit-btn:hover {
        background-color: #ccc;
      }
      .delete-btn {
        border: 2px solid red;
        background-color: white;
        color: red;
      }
      .delete-btn:hover {
        background-color: red;
        color: white;
      }
      /* Popup styling for editing */
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
    // If currentDesc is "null" (as a string) or null/undefined, set it to empty string.
    const displayDesc = (!currentDesc || currentDesc === "null") ? "" : currentDesc;
    
    // Create the popup element
    const popup = document.createElement("div");
    popup.classList.add("edit-popup");
    popup.innerHTML = `
      <div class="popup-content">
        <h3>Edit Item</h3>
        <label for="edit-name">Name:</label>
        <input type="text" id="edit-name" value="${currentName}">
        <label for="edit-desc">Description:</label>
        <input type="text" id="edit-desc" value="${displayDesc}">
        <button id="save-edit">Save</button>
        <button id="cancel-edit">Cancel</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Cancel editing: simply remove the popup.
    popup.querySelector("#cancel-edit").addEventListener("click", () => {
      popup.remove();
    });

    // Save edits and send a PUT request.
    popup.querySelector("#save-edit").addEventListener("click", async () => {
      const updatedName = popup.querySelector("#edit-name").value;
      // If updatedDesc is empty or falsey, send empty string.
      const updatedDesc = popup.querySelector("#edit-desc").value || "";
      
      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_name: updatedName,
            description: updatedDesc
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

// Fetch and display items on the wardrobe page
document.addEventListener("DOMContentLoaded", async () => {
  const itemsContainer = document.getElementById("inventory");

  async function fetchItems() {
    try {
      const response = await fetch("/api/wardrobe/items");
      if (!response.ok) throw new Error("Failed to fetch items");
      const items = await response.json();
      itemsContainer.innerHTML = "";
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

  window.fetchItems = fetchItems;

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

  fetchItems();
});
