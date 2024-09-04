// loadComponents.js

function loadHTMLComponent(componentId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(componentId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    // Load Header
    loadHTMLComponent('header-placeholder', '/admin/includes/header.html');

    // Load Sidebar
    loadHTMLComponent('sidebar-placeholder', '/admin/includes/sidebar.html');

    // Load Footer
    loadHTMLComponent('footer-placeholder', '/admin/includes/footer.html');
});
