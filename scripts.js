document.addEventListener('DOMContentLoaded', function () {
    // Load header and footer dynamically
    loadComponent('header-container', 'header.html', function () {
        initializeNavbar();
        updateCartCount(); // Initialize the cart count on page load after header is loaded
        loadUsername();  // Load the username after header is fully loaded
    });
    loadComponent('footer-container', 'footer.html');
});

function loadComponent(id, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();  // Initialize navbar scripts after loading
        })
        .catch(error => console.error('Error loading component:', error));
}

// Function to open the navigation menu
function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

// Function to close the navigation menu
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Function to toggle the dropdown menu
function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
    }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches(".dropdown a img")) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }
};

// Logout function, clearing local storage and redirecting to the login page
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
}

// Load the username from local storage and update the UI accordingly
function loadUsername() {
    const username = localStorage.getItem("username");
    const usernameDisplay = document.getElementById("username-display");
    const profileLink = document.getElementById("profile-link");
    const logoutLink = document.getElementById("logout-link");
    const loginLink = document.getElementById("login-link");
    const signupLink = document.getElementById("signup-link");

    if (username) {
        // User is logged in
        usernameDisplay.innerText = username;
        if (profileLink) profileLink.style.display = "block";
        if (logoutLink) logoutLink.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
        if (signupLink) signupLink.style.display = "none";
        initializeLogout(); // Attach the logout functionality
    } else {
        // User is not logged in
        usernameDisplay.innerText = "Guest";
        if (profileLink) profileLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
        if (loginLink) loginLink.style.display = "block";
        if (signupLink) signupLink.style.display = "block";
    }
}

// Attach event listener to the logout link
function initializeLogout() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }
}

// Update the cart count displayed in the UI
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Initialize the navbar by attaching event listeners
function initializeNavbar() {
    // Ensure all elements are loaded before attaching event listeners
    const toggleIcon = document.querySelector('.toggle_icon');
    const closeBtn = document.querySelector('.closebtn');
    const dropdown = document.querySelector('.dropdown');

    if (toggleIcon) {
        toggleIcon.addEventListener('click', openNav);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeNav);
    }

    if (dropdown) {
        dropdown.addEventListener('click', toggleDropdown);
    }
    loadUsername();  // Load the username and attach event listeners
}
