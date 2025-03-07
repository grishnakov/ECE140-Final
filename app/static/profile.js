document.addEventListener("DOMContentLoaded", async () => {
  const devicesContainer = document.getElementById("reg-devices");

  async function fetchDevices() {
    try {
      const response = await fetch("/api/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");

      const devices = await response.json();
      devicesContainer.innerHTML = ""; // Clear previous content

      devices.forEach(device => {
        const deviceElem = document.createElement("device-component");
        deviceElem.setAttribute("device-id", device.id);
        deviceElem.setAttribute("device-name", device.name);
        deviceElem.setAttribute("sensor-type", device.sensorType);

        devicesContainer.appendChild(deviceElem);
      });
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  }

  document.getElementById("add-item-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const newItemID = document.getElementById("new-item-id").value;
    const newItemName = document.getElementById("new-item-name").value;

    try {
      const response = await fetch("/api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemID: newItemID,
          itemName: newItemName
         }),
      });

      if (response.ok) {
        fetchDevices(); // Refresh list
      } else {
        alert("Failed to add device.");
      }
    } catch (error) {
      console.error("Error adding device:", error);
    }
  });

  fetchDevices(); // Initial fetch on page load
});
