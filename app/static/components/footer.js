class Footer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Create the footer container
    const footerContainer = document.createElement("div");
    footerContainer.id = "footer";

    // Create the title for "About Us"
    const aboutUsTitle = document.createElement("a");
    aboutUsTitle.textContent = "About Us";

    aboutUsTitle.href = "/"

    // Append the title to the footer container
    footerContainer.appendChild(aboutUsTitle);

    // Append the footer container to the shadow DOM
    this.shadowRoot.appendChild(footerContainer);

    // Add some styling to the shadow DOM
    const styles = document.createElement("style");
    styles.innerHTML = `
      :host {
        display: block;
        width: 100%;
      }
      #footer {
        text-align: center;
        margin-bottom: 0;
      }
    `;
    this.shadowRoot.appendChild(styles);
  }
}

// Define the custom element
customElements.define("custom-footer", Footer);
