// EmailJS Configuration for Fruitingo Admin Email Verification
// Replace these values with your actual EmailJS credentials

const EMAILJS_CONFIG = {
    // EmailJS Public Key (replace with your actual public key)
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',
    
    // EmailJS Service ID (replace with your actual service ID)
    SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID',
    
    // EmailJS Template ID (replace with your actual template ID)
    TEMPLATE_ID: 'YOUR_EMAILJS_TEMPLATE_ID',
    
    // EmailJS configuration options
    OPTIONS: {
        timeout: 5000, // 5 seconds timeout
        secure: true // Use HTTPS
    }
};

// Debug mode - set to true for development, false for production
const EMAILJS_DEBUG = true;

// Make configuration available globally
window.EMAILJS_CONFIG = EMAILJS_CONFIG;
window.EMAILJS_DEBUG = EMAILJS_DEBUG;
