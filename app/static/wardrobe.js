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

    // const editButton = document.createElement("button");
    // editButton.textContent = "Edit";
    // editButton.addEventListener("click", () => this.editItem(itemId));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => this.deleteItem(itemId, itemContainer));

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

  async deleteItem(itemId, itemElem) {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`/api/wardrobe/items/${itemId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert(`Item with ID ${itemId} deleted successfully.`);
          window.location.reload(); // Refresh the entire page
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
