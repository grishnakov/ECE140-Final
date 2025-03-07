import '/static/components/item.js';

document.addEventListener("DOMContentLoaded", async () => {
  const itemsContainer = document.getElementById("inventory");

  async function fetchItems() {
    try {
      const response = await fetch("/api/wardrobe/items");
      if (!response.ok) throw new Error("Failed to fetch items");

      const items = await response.json();
      itemsContainer.innerHTML = ""; // Clear previous content

      items.forEach(item => {
        const itemElem = document.createElement("item-component");
        itemElem.setAttribute("item-desc", item.id);
        itemElem.setAttribute("item-name", item.name);
        itemsContainer.appendChild(itemElem);
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  document.getElementById("add-item-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const newItemDesc = document.getElementById("new-item-desc").value;
    const newItemName = document.getElementById("new-item-name").value;

    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemName: newItemName,
          itemDesc: newItemDesc
         }),
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
