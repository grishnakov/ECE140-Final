class Footer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/static/styles/global.css";
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
    this.shadowRoot.appendChild(styles);
  }
}

// Define the custom element
customElements.define("custom-footer", Footer);
