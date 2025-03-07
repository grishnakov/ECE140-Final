import "/static/components/item.js";

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
        itemElem.setAttribute("item-id", item.id); // Fixed attribute name
        itemElem.setAttribute("item-name", item.item_name);
        itemElem.setAttribute("item-desc", item.item_desc);
        itemsContainer.appendChild(itemElem);
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  document
    .getElementById("add-item-form")
    .addEventListener("submit", async (event) => {
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
