class Navbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const styles = document.createElement("style");
    styles.innerHTML = ``;

    // Attach element to shadow DOM
    const navbarContainer = document.createElement("div");
    navbarContainer.id = "navbar";
    this.shadowRoot.appendChild(navbarContainer);

    // Create nav element to contain anchors to other pages
    const navbar = document.createElement("nav");
    navbarContainer.appendChild(navbar);

    // Check if user is logged in (assuming a flag in localStorage)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Dashboard link
    const anchorToDashboard = document.createElement("a");
    anchorToDashboard.id = "anchorToDashboard";
    anchorToDashboard.href = "./dashboard/dashboard.html";
    anchorToDashboard.innerHTML = `WEATHER`;

    // Conditional links
    let anchorToWardrobe = document.createElement("a");
    let anchorToProfile = document.createElement("a");

    if (isLoggedIn) {
      // Show wardrobe and profile links
      anchorToWardrobe.id = "anchorToWardrobe";
      anchorToWardrobe.href = "./wardrobe/wardrobe.html";
      anchorToWardrobe.innerHTML = `<button>WARDROBE</button>`;

      anchorToProfile.id = "anchorToProfile";
      anchorToProfile.href = "./profile/profile.html";
      anchorToProfile.innerHTML = `<button>PROFILE</button>`;
    } else {
      // Show login and signup instead
      anchorToWardrobe.id = "anchorToLogin";
      anchorToWardrobe.href = "./login/login.html";
      anchorToWardrobe.innerHTML = `<button>LOGIN</button>`;

      anchorToProfile.id = "anchorToSignup";
      anchorToProfile.href = "./signup/signup.html";
      anchorToProfile.innerHTML = `<button>SIGN UP</button>`;
    }

    // Create text input field instead of plain text
    const aiChat = document.createElement("input");
    aiChat.type = "text";
    aiChat.placeholder = "What should I wear today?";
    aiChat.value = "What should I wear today?";
    aiChat.id = "aiChatInput";

    // Append elements
    navbar.appendChild(anchorToDashboard);
    navbar.appendChild(aiChat);
    navbar.appendChild(anchorToWardrobe);
    navbar.appendChild(anchorToProfile);

    this.shadowRoot.appendChild(styles);
  }
}

customElements.define("custom-navbar", Navbar);
