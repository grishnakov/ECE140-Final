class Navbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Basic styling for layout
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/static/styles/navbar.css";

    // Create main navbar container
    const navbarContainer = document.createElement("div");
    navbarContainer.id = "navbar";

    // Create sub-containers for left, center, and right
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("left-container");
    const logo = document.createElement("h3");

    logo.innerText = "WEARTHER";
    leftContainer.appendChild(logo);

    const centerContainer = document.createElement("div");
    centerContainer.classList.add("center-container");

    const rightContainer = document.createElement("div");
    rightContainer.classList.add("right-container");

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      // CENTER: Dashboard, Wardrobe, Profile
      const anchorDashboard = document.createElement("a");
      anchorDashboard.href = "/dashboard";
      anchorDashboard.innerText = "Dashboard";
      centerContainer.appendChild(anchorDashboard);

      const anchorWardrobe = document.createElement("a");
      anchorWardrobe.href = "/wardrobe";
      anchorWardrobe.innerText = "Wardrobe";
      centerContainer.appendChild(anchorWardrobe);

      const anchorProfile = document.createElement("a");
      anchorProfile.href = "/profile";
      anchorProfile.innerText = "Profile";
      centerContainer.appendChild(anchorProfile);

      // RIGHT: Sign Out
      const anchorSignOut = document.createElement("a");
      anchorSignOut.href = "/signout"; // Or a dedicated /logout endpoint if desired
      anchorSignOut.innerText = "Sign Out";
      anchorSignOut.addEventListener("click", (e) => {
        // e.preventDefault();
        // Example: remove login flag, redirect to home
        localStorage.setItem("isLoggedIn", "false");
        window.location.href = "/";
      });
      rightContainer.appendChild(anchorSignOut);

    } else {
      // CENTER: Home
      const anchorHome = document.createElement("a");
      anchorHome.href = "/";
      anchorHome.innerText = "Home";
      centerContainer.appendChild(anchorHome);

      // RIGHT: Login, Sign Up
      const anchorLogin = document.createElement("a");
      anchorLogin.href = "/login";
      anchorLogin.innerText = "Login";
      rightContainer.appendChild(anchorLogin);

      const anchorSignup = document.createElement("a");
      anchorSignup.href = "/signup";
      anchorSignup.innerText = "Sign Up";
      rightContainer.appendChild(anchorSignup);
    }

    // Assemble containers
    navbarContainer.appendChild(leftContainer);
    navbarContainer.appendChild(centerContainer);
    navbarContainer.appendChild(rightContainer);

    // Attach to shadow DOM
    this.shadowRoot.appendChild(styles);
    this.shadowRoot.appendChild(navbarContainer);
  }
}

customElements.define("custom-navbar", Navbar);
