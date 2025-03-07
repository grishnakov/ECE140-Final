class ItemComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const itemId = this.getAttribute("item-id");
    const itemName = this.getAttribute("item-name");
    const itemDesc = this.getAttribute("item-desc")

    const itemContainer = document.createElement("div");
    itemContainer.classList.add("item");

    const itemTitle = document.createElement("span");
    itemTitle.textContent = `${itemName} (ID: ${itemId}) - Description: ${itemDesc}`;
    itemContainer.appendChild(itemTitle);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => this.editItem(itemId));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
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

  editItem(itemId) {
    console.log(`Editing item with ID: ${itemId}`);
    alert(`Editing item with ID: ${itemId}`);
    
    const editForm = document.createElement("form");
    editForm.innerHTML = ''


  }
  
  async deleteItem(itemId, itemElem) {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          alert(`Item with ID ${itemId} deleted successfully.`);
          itemElem.remove();  // Remove the item from the DOM
        } else {
          alert("Failed to delete item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  }
}




customElements.define("item-component", ItemComponent);

export default ItemComponent;
