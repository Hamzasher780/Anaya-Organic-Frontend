// config.js

const config = {
    API_URL: window.location.origin.includes('localhost') ? 'http://localhost:3000' : 'https://your-live-backend-url.com'
};

// Expose the config object globally so it can be accessed in other scripts
window.config = config;
