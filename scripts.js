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

function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
    }
}

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

// Make logout globally available
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
}

function loadUsername() {
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("username-display").innerText = username;
        initializeLogout();  // Attach the logout functionality after setting the HTML
    } else {
        document.getElementById("username-display").innerText = "Guest";
    }
}

function initializeLogout() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

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
