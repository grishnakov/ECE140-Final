import '/static/components/item.js';

document.addEventListener("DOMContentLoaded", async () => {
  const inventoryContainer = document.getElementById("inventory");

  const fetchItems = async () => {
    // Replace this with an actual API call
    return [
      { id: "1", name: "T-shirt" },
      { id: "2", name: "Jeans" },
      { id: "3", name: "Jacket" },
      { id: "4", name: "Sneakers" }
    ];
  };

  try {
    const items = await fetchItems();

    items.forEach(item => {
      // Create a container for the item
      const itemContainer = document.createElement("div");
      itemContainer.classList.add("item-wrapper");

      // Create the custom element
      const itemElement = document.createElement("item-component");
      itemElement.setAttribute("item-id", item.id);
      itemElement.setAttribute("item-name", item.name);

      // Append to container
      itemContainer.appendChild(itemElement);

      // Append container to inventory
      inventoryContainer.appendChild(itemContainer);
    });
  } catch (error) {
    console.error("Error fetching items:", error);
  }
});
