document.addEventListener("DOMContentLoaded", () => {
  const devicesContainer = document.getElementById("reg-devices");

  async function fetchDevices() {
    try {
      const response = await fetch("/api/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const devices = await response.json();
      devicesContainer.innerHTML = "";
      devices.forEach(device => {
        const deviceElem = document.createElement("device-component");
        deviceElem.setAttribute("device_id", device.device_id);
        devicesContainer.appendChild(deviceElem);
      });
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  }

  const form = document.getElementById("add-device-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent native submission
      console.log("Intercepted form submission");

      const formData = new FormData(event.target);
      try {
        const response = await fetch("/api/devices/register", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          fetchDevices(); // Refresh devices list
        } else {
          const errorData = await response.json();
          alert("Failed to add device: " + errorData.detail);
        }
      } catch (error) {
        console.error("Error adding device:", error);
      }
    });
  } else {
    console.error("Form element not found");
  }

  fetchDevices();
});
