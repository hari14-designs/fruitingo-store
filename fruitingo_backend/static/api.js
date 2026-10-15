// Fruitingo API Integration for Django Backend
// This replaces LocalStorage functionality with Django API calls

const API_BASE_URL = '';

// Customer API Functions
async function customerRegister(mobile, displayName = '', email = '', gender = '', dob = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customer/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobile,
                display_name: displayName,
                email: email,
                gender: gender,
                dob: dob
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

async function customerLogin(mobile) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customer/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobile: mobile })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function getCustomerProfile(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customer/profile/${customerId}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get profile error:', error);
        return { success: false, error: error.message };
    }
}

async function updateCustomerProfile(customerData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customer/update/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

// Product API Functions
async function getProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get products error:', error);
        return { success: false, error: error.message };
    }
}

async function createProduct(productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/product/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Create product error:', error);
        return { success: false, error: error.message };
    }
}

// Order API Functions
async function createOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/order/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Create order error:', error);
        return { success: false, error: error.message };
    }
}

async function getCustomerOrders(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${customerId}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get orders error:', error);
        return { success: false, error: error.message };
    }
}

// Wishlist API Functions
async function addToWishlist(customerId, productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist/add/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerId,
                product_id: productId
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return { success: false, error: error.message };
    }
}

async function getCustomerWishlist(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${customerId}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get wishlist error:', error);
        return { success: false, error: error.message };
    }
}

async function removeFromWishlist(customerId, productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${customerId}/${productId}/`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return { success: false, error: error.message };
    }
}

// Notification API Functions
async function getCustomerNotifications(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${customerId}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get notifications error:', error);
        return { success: false, error: error.message };
    }
}

async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notification/read/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notification_id: notificationId })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Mark notification read error:', error);
        return { success: false, error: error.message };
    }
}

// Admin API Functions
async function adminLogin(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Admin login error:', error);
        return { success: false, error: error.message };
    }
}

async function getAdminSecurity() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/security/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get admin security error:', error);
        return { success: false, error: error.message };
    }
}

async function updateAdminPassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/password/update/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Update admin password error:', error);
        return { success: false, error: error.message };
    }
}

async function updateRecoveryEmail(currentPassword, newEmail) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/recovery-email/update/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_email: newEmail
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Update recovery email error:', error);
        return { success: false, error: error.message };
    }
}

async function getAllCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/customers/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get all customers error:', error);
        return { success: false, error: error.message };
    }
}

// Contact API Functions
async function submitContactMessage(name, email, phone, message) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/submit/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, message })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Submit contact message error:', error);
        return { success: false, error: error.message };
    }
}

async function getContactMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/messages/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get contact messages error:', error);
        return { success: false, error: error.message };
    }
}

// Session Management
function setCurrentCustomer(customerData) {
    sessionStorage.setItem('fruitingo_current_customer', JSON.stringify(customerData));
}

function getCurrentCustomer() {
    const customerData = sessionStorage.getItem('fruitingo_current_customer');
    return customerData ? JSON.parse(customerData) : null;
}

function clearCurrentCustomer() {
    sessionStorage.removeItem('fruitingo_current_customer');
}

function setAdminLoggedIn(loggedIn) {
    sessionStorage.setItem('fruitingo_admin_logged_in', loggedIn);
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('fruitingo_admin_logged_in') === 'true';
}

function clearAdminSession() {
    sessionStorage.removeItem('fruitingo_admin_logged_in');
}

// Export functions for use in main.js
window.FruitingoAPI = {
    customerRegister,
    customerLogin,
    getCustomerProfile,
    updateCustomerProfile,
    getProducts,
    createProduct,
    createOrder,
    getCustomerOrders,
    addToWishlist,
    getCustomerWishlist,
    removeFromWishlist,
    getCustomerNotifications,
    markNotificationRead,
    adminLogin,
    getAdminSecurity,
    updateAdminPassword,
    updateRecoveryEmail,
    getAllCustomers,
    submitContactMessage,
    getContactMessages,
    setCurrentCustomer,
    getCurrentCustomer,
    clearCurrentCustomer,
    setAdminLoggedIn,
    isAdminLoggedIn,
    clearAdminSession
};
