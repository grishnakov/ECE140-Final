// class DeviceComponent extends HTMLElement {
//   constructor() {
//     super();
//     this.attachShadow({ mode: "open" });
//   }
//
//   connectedCallback() {
//     const deviceId = this.getAttribute("device_id");
//
//     const container = document.createElement("div");
//     container.classList.add("device");
//
//     const idElem = document.createElement("p");
//     idElem.textContent = `ID: ${deviceId}`;
//
//     const deleteButton = document.createElement("button");
//     deleteButton.textContent = "Delete";
//     deleteButton.addEventListener("click", () => this.deleteDevice(deviceId));
//
//     container.appendChild(idElem);
//     container.appendChild(deleteButton);
//
//
//     const styles = document.createElement("style");
//     styles.textContent = `
//       .device {
//         border: 1px solid #ccc;
//         padding: 10px;
//         margin: 10px 0;
//         border-radius: 5px;
//         background-color: #f9f9f9;
//       }
//       h3 {
//         margin: 0;
//         font-size: 1.2em;
//       }
//       p {
//         margin: 5px 0;
//         color: gray;
//       }
//       button {
//         padding: 5px 10px;
//         background-color: red;
//         color: white;
//         border: none;
//         cursor: pointer;
//       }
//       button:hover {
//         background-color: darkred;
//       }
//     `;
//
//     this.shadowRoot.appendChild(styles);
//     this.shadowRoot.appendChild(container);
//   }
//
//   async deleteDevice(deviceId) {
//     if (confirm("Are you sure you want to delete this device?")) {
//       try {
//         const response = await fetch(`/api/delete-device/${deviceId}`, {
//           method: "DELETE",
//         });
//
//         if (response.ok) {
//           this.remove();
//         } else {
//           alert("Failed to delete device.");
//         }
//       } catch (error) {
//         console.error("Error deleting device:", error);
//       }
//     }
//   }
// }
//
// customElements.define("device-component", DeviceComponent);
class DeviceComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const deviceId = this.getAttribute("device_id");

    const container = document.createElement("div");
    container.classList.add("device");

    const idElem = document.createElement("p");
    idElem.textContent = `ID: ${deviceId}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => this.deleteDevice(deviceId));

    container.appendChild(idElem);
    container.appendChild(deleteButton);

    const styles = document.createElement("style");
    styles.textContent = `
      .device {
        width: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #ccc;
        padding: 10px;
        margin: 10px;
        border-radius: 5px;
        background-color: #f9f9f9;
        box-sizing: border-box;
      }
      p {
        margin: 5px 0;
        color: gray;
      }
      button {
        width: 80%;
        margin: 10px auto 0;
        padding: 5px 0;
        border: 2px solid red;
        background-color: white;
        color: red;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: red;
        color: white;
      }
    `;
    
    this.shadowRoot.appendChild(styles);
    this.shadowRoot.appendChild(container);
  }

  async deleteDevice(deviceId) {
    if (confirm("Are you sure you want to delete this device?")) {
      try {
        const response = await fetch(`/api/delete-device/${deviceId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          this.remove();
        } else {
          alert("Failed to delete device.");
        }
      } catch (error) {
        console.error("Error deleting device:", error);
      }
    }
  }
}

customElements.define("device-component", DeviceComponent);

