// class Navbar extends HTMLElement {
//   constructor() {
//     super();
//     this.attachShadow({ mode: "open" });
//   }
//
//   connectedCallback() {
//     const styles = document.createElement("style");
//     styles.innerHTML = ``;
//
//     // Attach element to shadow DOM
//     const navbarContainer = document.createElement("div");
//     navbarContainer.id = "navbar";
//     this.shadowRoot.appendChild(navbarContainer);
//
//     // Create nav element to contain anchors to other pages
//     const navbar = document.createElement("nav");
//     navbarContainer.appendChild(navbar);
//
//     // Check if user is logged in (assuming a flag in localStorage)
//     const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
//
//     // Dashboard link
//     const anchorToDashboard = document.createElement("a");
//     anchorToDashboard.id = "anchorToDashboard";
//     anchorToDashboard.href = "/dashboard";
//     anchorToDashboard.innerHTML = `WEARTHER`;
//
//     // Conditional links
//     let anchorToWardrobe = document.createElement("a");
//     let anchorToProfile = document.createElement("a");
//
//     if (isLoggedIn) {
//       // Show wardrobe and profile links
//       anchorToWardrobe.id = "anchorToWardrobe";
//       anchorToWardrobe.href = "/wardrobe";
//       anchorToWardrobe.innerHTML = `<button>WARDROBE</button>`;
//
//       anchorToProfile.id = "anchorToProfile";
//       anchorToProfile.href = "/profile";
//       anchorToProfile.innerHTML = `<button>PROFILE</button>`;
//     } else {
//       // Show login and signup instead
//       anchorToWardrobe.id = "anchorToLogin";
//       anchorToWardrobe.href = "/login";
//       anchorToWardrobe.innerHTML = `<button>LOGIN</button>`;
//
//       anchorToProfile.id = "anchorToSignup";
//       anchorToProfile.href = "/signup";
//       anchorToProfile.innerHTML = `<button>SIGN UP</button>`;
//     }
//
//     // Create AI Chat input (or disabled text if not logged in)
//     const aiChat = document.createElement("input");
//     aiChat.id = "aiChatInput";
//
//     if (isLoggedIn) {
//       aiChat.type = "text";
//       aiChat.placeholder = "What should I wear today?";
//       aiChat.value = "What should I wear today?";
//     } else {
//       aiChat.type = "text";
//       aiChat.value = "Login to ask AI";
//       aiChat.disabled = true; // Make it unclickable
//       aiChat.style.cursor = "not-allowed"; 
//       aiChat.style.opacity = "0.6";
//     }
//
//     // Append elements
//     navbar.appendChild(anchorToDashboard);
//     navbar.appendChild(aiChat);
//     navbar.appendChild(anchorToWardrobe);
//     navbar.appendChild(anchorToProfile);
//
//     this.shadowRoot.appendChild(styles);
//   }
// }
//
// customElements.define("custom-navbar", Navbar);
class Navbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Basic styling for layout
    const styles = document.createElement("style");
    styles.innerHTML = `
      #navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        background: #f8f8f8;
      }
      .left-container,
      .center-container,
      .right-container {
        display: flex;
        align-items: center;
      }
      /* Make the center container expand and center its items horizontally */
      .center-container {
        flex: 1;
        justify-content: center;
        gap: 1rem;
      }
      .right-container {
        gap: 1rem;
      }
      a, button {
        text-decoration: none;
        color: #333;
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
      }
      a:hover, button:hover {
        text-decoration: underline;
      }
    `;

    // Create main navbar container
    const navbarContainer = document.createElement("div");
    navbarContainer.id = "navbar";

    // Create sub-containers for left, center, and right
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("left-container");

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
      anchorSignOut.href = "#"; // Or a dedicated /logout endpoint if desired
      anchorSignOut.innerText = "Sign Out";
      anchorSignOut.addEventListener("click", (e) => {
        e.preventDefault();
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
