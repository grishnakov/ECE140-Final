class ItemComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const itemId = this.getAttribute("item-id");
    const itemName = this.getAttribute("item-name");

    const itemContainer = document.createElement("div");
    itemContainer.classList.add("item");

    const itemTitle = document.createElement("span");
    itemTitle.textContent = `${itemName} (ID: ${itemId})`;
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
  }

  deleteItem(itemId) {
    console.log(`Deleting item with ID: ${itemId}`);
    alert(`Deleting item with ID: ${itemId}`);
  }
}

customElements.define("item-component", ItemComponent);

export default ItemComponent;
