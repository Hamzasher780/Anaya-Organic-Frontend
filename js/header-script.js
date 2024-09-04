// Navbar toggle and dropdown functionality
function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function toggleDropdown() {
    document.getElementById("dropdown-menu").classList.toggle("show");
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

// Logout functionality
function logout() {
    console.log("Logout function called");
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    window.location.href = "login.html";
}

// Load username when logged in
function loadUsername() {
    const username = localStorage.getItem("username");
    if (username) {
        console.log("Username found: ", username);
        document.getElementById("username-display").innerText = username;
        document.getElementById("dropdown-menu").innerHTML = `
            <a href="#"><i class="fa fa-user"></i> Profile</a>
            <a href="#" onclick="logout()"><i class="fa fa-sign-out"></i> Logout</a>
        `;
    } else {
        console.log("No username found in localStorage");
    }
}

window.onload = loadUsername;
