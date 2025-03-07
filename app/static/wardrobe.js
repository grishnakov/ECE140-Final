import '/static/components/item.js';

document.addEventListener("DOMContentLoaded", async () => {
  const inventoryContainer = document.getElementById("inventory");

  const fetchItems = async () => {
    // Replace this with an actual API call

    return [
     
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

  async function fetchItems() {
    try {
      const response = await fetch("/api/wardrobe/items");
      if (!response.ok) throw new Error("Failed to fetch items");

      const items = await response.json();
      itemsContainer.innerHTML = ""; // Clear previous content

      items.forEach(item => {
        const itemElem = document.createElement("item-component");
        itemElem.setAttribute("item-id", item.id);
        itemElem.setAttribute("item-name", item.name);
        itemsContainer.appendChild(itemElem);
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  document.getElementById("add-item-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const newDeviceId = document.getElementById("new-item").value;

    try {
      const response = await fetch("/api/wardrobe/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: newDeviceId }),
      });

      if (response.ok) {
        fetchDevices(); // Refresh list
      } else {
        alert("Failed to add item.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  });

  fetchDevices(); // Initial fetch on page load


});
