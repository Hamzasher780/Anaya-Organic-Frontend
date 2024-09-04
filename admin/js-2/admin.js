// admin.js

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Load dashboard data
    loadDashboardData();

    // Load notifications
    loadNotifications();

    function loadNotifications() {
        fetch('/api/notifications') // Adjust API endpoint as necessary
            .then(response => response.json())
            .then(data => {
                document.getElementById('notification-count').textContent = data.count;
                let notificationDropdown = document.querySelector('#notificationsDropdown + .dropdown-menu');
                notificationDropdown.innerHTML = ''; // Clear existing items
                data.notifications.forEach(notification => {
                    let item = document.createElement('a');
                    item.className = 'dropdown-item';
                    item.href = notification.link;
                    item.textContent = notification.message;
                    notificationDropdown.appendChild(item);
                });
                let allNotificationsLink = document.createElement('a');
                allNotificationsLink.className = 'dropdown-item text-center';
                allNotificationsLink.href = 'notifications.html';
                allNotificationsLink.textContent = 'View All Notifications';
                notificationDropdown.appendChild(allNotificationsLink);
            })
            .catch(error => console.error('Error loading notifications:', error));
    }

    function loadDashboardData() {
        fetch('/api/dashboard')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-products').textContent = data.totalProducts;
                document.getElementById('total-orders').textContent = data.totalOrders;
                document.getElementById('total-users').textContent = data.totalUsers;
            })
            .catch(error => console.error('Error fetching dashboard data:', error));
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Redirect to login if not authenticated
    const authToken = localStorage.getItem('authToken');
    if (!authToken && window.location.pathname !== '/login.html' && window.location.pathname !== '/signup.html') {
        window.location.href = 'login.html';
    }

    // Log out functionality
    document.querySelector('.logout-btn').addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    // Example of using the token for authenticated requests
    function fetchProtectedResource() {
        fetch('/api/protected', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Error fetching protected resource:', error));
    }
});
document.addEventListener('click', function (e) {
    const isDropdownButton = e.target.matches("[role='button']");

    if (!isDropdownButton && e.target.closest('.dropdown-menu') != null) return;

    let currentDropdown;
    if (isDropdownButton) {
        currentDropdown = e.target.closest('.nav-item').querySelector('.dropdown-menu');
        currentDropdown.classList.toggle('show');
    }

    document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
        if (dropdown === currentDropdown) return;
        dropdown.classList.remove('show');
    });
});
