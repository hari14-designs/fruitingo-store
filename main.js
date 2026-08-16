// Fruitingo E-commerce - Main JavaScript file

// Mock Products Seed Database
const defaultProducts = [
    {
        id: 'fruitingo-250',
        name: 'Fruitingo Nendran Banana Powder (250g)',
        price: 249,
        weight: '250g',
        desc: '100% natural, preservative-free Nendran banana powder. Sourced directly from local farmers, sun-dried, and finely ground. Perfect baby food and nutritional health mix.',
        image: 'assets/fruitingo_product.jpg',
        rating: 4.8,
        reviewsCount: 142,
        tag: 'Best Seller'
    },
    {
        id: 'fruitingo-500',
        name: 'Fruitingo Premium Duo Pack (500g)',
        price: 469,
        weight: '500g (2 x 250g)',
        desc: 'Value duo pack. Store one and use one! Made from premium selected raw Nendran bananas. Rich in dietary fiber, potassium, and essential vitamins.',
        image: 'assets/fruitingo_product.jpg',
        rating: 4.9,
        reviewsCount: 88,
        tag: 'Popular'
    },
    {
        id: 'fruitingo-1000',
        name: 'Fruitingo Family Value Pack (1kg)',
        price: 899,
        weight: '1kg (4 x 250g)',
        desc: 'Ideal for healthy families, fitness enthusiasts, and baking. Use as a gluten-free flour replacement in cakes, cookies, and breads. High savings pack!',
        image: 'assets/fruitingo_product.jpg',
        rating: 4.9,
        reviewsCount: 64,
        tag: 'Super Saver'
    }
];

// Load Products from LocalStorage or Seed it
let products = JSON.parse(localStorage.getItem('fruitingo_products'));
if (!products || products.length === 0) {
    localStorage.setItem('fruitingo_products', JSON.stringify(defaultProducts));
    products = defaultProducts;
}

// Initialize Cart
let cart = JSON.parse(localStorage.getItem('fruitingo_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initGlobal();
    initRecipeCalc();
    initAccordion();
    initSlider();
    
    // Dynamic Page Render Initializations
    if (document.getElementById('products-container')) {
        renderProductsHome();
    }
    if (document.getElementById('admin-products-table')) {
        renderAdminDashboard();
    }
});

// Global UI Initializations (Header, Cart Drawer, Footer)
function initGlobal() {
    // Nav Toggle for Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Cart Drawer Toggle
    const cartBtn = document.querySelector('.cart-icon-btn');
    const closeCartBtn = document.querySelector('.cart-close-btn');
    const drawer = document.querySelector('.cart-drawer');
    const backdrop = document.querySelector('.cart-backdrop');

    if (cartBtn && drawer && backdrop) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            drawer.classList.add('active');
            backdrop.classList.add('active');
            renderCartDrawer();
        });
    }

    if (closeCartBtn && drawer && backdrop) {
        const hideCart = () => {
            drawer.classList.remove('active');
            backdrop.classList.remove('active');
        };
        closeCartBtn.addEventListener('click', hideCart);
        backdrop.addEventListener('click', hideCart);
    }

    updateCartBadge();
    renderCartDrawer();
}

// Shopping Cart Core Functions
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = cart.reduce((total, item) => total + item.qty, 0);
    badges.forEach(badge => {
        badge.textContent = count;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    });
}

function addToCart(productId, quantity = 1, showDrawer = true) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            weight: product.weight,
            image: product.image,
            qty: quantity
        });
    }

    saveCart();
    updateCartBadge();
    renderCartDrawer();

    if (showDrawer) {
        const drawer = document.querySelector('.cart-drawer');
        const backdrop = document.querySelector('.cart-backdrop');
        if (drawer && backdrop) {
            drawer.classList.add('active');
            backdrop.classList.add('active');
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    renderCartDrawer();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartBadge();
        renderCartDrawer();
    }
}

function saveCart() {
    localStorage.setItem('fruitingo_cart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// Render Cart items in Drawer
function renderCartDrawer() {
    const cartBody = document.querySelector('.cart-body');
    const totalVal = document.getElementById('cart-total-value');
    
    if (!cartBody) return;

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty-message">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Your basket is empty</p>
                <a href="index.html#shop" class="btn btn-primary" style="margin-top: 1.5rem; font-size: 0.9rem;">Shop Fruitingo</a>
            </div>
        `;
        if (totalVal) totalVal.textContent = '₹0';
        return;
    }

    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-weight">${item.weight}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-controls">
                        <div class="qty-wrap">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    cartBody.innerHTML = html;
    if (totalVal) {
        totalVal.textContent = '₹' + getCartTotal();
    }
}

// Interactive Nutrition Calculator
function initRecipeCalc() {
    const ageSelect = document.getElementById('calc-age');
    const goalSelect = document.getElementById('calc-goal');
    const calcBtn = document.getElementById('btn-calculate');
    const resultBox = document.getElementById('calc-result');

    if (!calcBtn || !resultBox) return;

    calcBtn.addEventListener('click', () => {
        const age = ageSelect.value;
        const goal = goalSelect.value;

        let dosage = '';
        let guide = '';
        let benefits = '';

        if (age === 'baby') {
            dosage = '1 - 2 Teaspoons (5-10g) daily';
            guide = 'Mix with warm milk or water, cook on low flame for 5-8 mins until it thickens. Add organic jaggery or a pinch of ghee for extra taste.';
            benefits = 'High in potassium and starch, extremely gentle on baby\'s stomach, helps in healthy weight gain and natural bone development.';
        } else if (age === 'toddler') {
            dosage = '1 - 2 Tablespoons (15-30g) daily';
            guide = 'Stir into fresh porridge, fruit purée, curd, or puddings. Can also be baked into soft banana cakes.';
            benefits = 'Improves digestion, builds natural immunity, provides sustained energy for active toddlers, and prevents common constipation.';
        } else if (age === 'adult') {
            dosage = '2 - 3 Tablespoons (30-45g) daily';
            guide = 'Add to morning milkshakes, oats, gym protein shakes, or use as a 100% gluten-free baking flour substitute.';
            benefits = 'Excellent pre-workout energy source, rich in prebiotic fiber that supports gut health, keeps you full for longer, and aids post-workout recovery.';
        }

        // Apply Goal customization
        let goalText = '';
        switch(goal) {
            case 'weight':
                goalText = '<strong>Weight Gain Tip:</strong> Cook with full-fat milk and top with crushed dried fruits or a teaspoon of home-made ghee.';
                break;
            case 'digest':
                goalText = '<strong>Gut Health Tip:</strong> Prepare as a warm porridge or mix with warm water and a pinch of cumin/cardamom powder.';
                break;
            case 'bake':
                goalText = '<strong>Baking Tip:</strong> Substitute up to 30% of normal wheat flour with Fruitingo powder to make cakes ultra-moist and nutritious.';
                break;
            case 'immunity':
                goalText = '<strong>Immunity Tip:</strong> Add a pinch of dry ginger powder and turmeric while cooking the health mix.';
                break;
        }

        resultBox.innerHTML = `
            <span class="result-badge"><i class="fa-solid fa-circle-check"></i> Recommended Dosage</span>
            <div class="result-value">${dosage}</div>
            <div class="result-guide">
                <p style="margin-bottom: 0.75rem;"><strong>How to prepare:</strong> ${guide}</p>
                <p style="margin-bottom: 0.75rem;"><strong>Health Benefits:</strong> ${benefits}</p>
                <p style="color: var(--primary); font-size: 0.9rem;">${goalText}</p>
            </div>
        `;

        resultBox.classList.add('active');
    });
}

// Collapsible FAQ/Accordion Logic
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            
            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.paddingBottom = '1.5rem';
            } else {
                content.style.maxHeight = '0px';
                content.style.paddingBottom = '0px';
            }
            
            // Close other items
            const siblingItems = Array.from(item.parentElement.children).filter(child => child !== item);
            siblingItems.forEach(sibling => {
                sibling.classList.remove('active');
                const sibContent = sibling.querySelector('.accordion-content');
                if (sibContent) {
                    sibContent.style.maxHeight = '0px';
                    sibContent.style.paddingBottom = '0px';
                }
            });
        });
    });
}

// Image Slider Logic
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');

    if (!slides.length) return;

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        if (slideInterval) clearInterval(slideInterval);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoplay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startAutoplay();
        });
    });

    startAutoplay();

    const sliderSection = document.querySelector('.slider-section');
    if (sliderSection) {
        sliderSection.addEventListener('mouseenter', stopAutoplay);
        sliderSection.addEventListener('mouseleave', startAutoplay);
    }
}

// Render products dynamically on Homepage
function renderProductsHome() {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--gray-muted); grid-column: 1/-1;">No products available. Please add some via the Admin Dashboard.</p>`;
        return;
    }

    let html = '';
    products.forEach(p => {
        const tagHTML = p.tag ? `<span class="badge-tag">${p.tag}</span>` : '';
        const starsHTML = getRatingStarsHTML(p.rating);
        
        html += `
            <div class="product-card">
                <div class="product-image-wrap">
                    ${tagHTML}
                    <img src="${p.image}" alt="${p.name}" class="product-card-img">
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-title">${p.name}</h3>
                    <p class="product-card-desc">${p.desc}</p>
                    <div class="product-rating">
                        ${starsHTML}
                        <span>${p.rating} (${p.reviewsCount} reviews)</span>
                    </div>
                    <div class="product-card-footer">
                        <div class="price-tag">₹${p.price} <span>/ ${p.weight}</span></div>
                        <button class="btn btn-primary" onclick="addToCart('${p.id}', 1)" style="padding: 0.65rem 1.25rem; font-size: 0.9rem;">
                            <i class="fa-solid fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Rating Stars HTML generator
function getRatingStarsHTML(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalf) {
            starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            starsHTML += '<i class="fa-regular fa-star"></i>';
        }
    }
    return starsHTML;
}

// Render Admin Dashboard list
function renderAdminDashboard() {
    const tableBody = document.getElementById('admin-products-table');
    const totalProdCount = document.getElementById('admin-total-products');
    
    if (!tableBody) return;

    if (totalProdCount) {
        totalProdCount.textContent = products.length;
    }

    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-muted);">
                    No products listed. Fill the form to add a new product.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    products.forEach((p, idx) => {
        html += `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); text-align: center;">
                    <img src="${p.image}" alt="${p.name}" style="width: 48px; height: 48px; object-fit: contain; background: var(--sand); border-radius: 8px;">
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 700; color: var(--chocolate);">${p.name}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${p.weight}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 800; color: var(--chocolate);">₹${p.price}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);"><span class="badge-tag" style="position: static; font-size: 0.7rem; background-color: var(--secondary);">${p.tag || 'Standard'}</span></td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); text-align: center;">
                    <button onclick="adminDeleteProduct('${p.id}')" style="background: transparent; border: none; color: #EF4444; cursor: pointer; font-size: 1.1rem; padding: 0.5rem; transition: var(--transition-fast);" title="Delete Product">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Delete Product
function adminDeleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    products = products.filter(p => p.id !== id);
    localStorage.setItem('fruitingo_products', JSON.stringify(products));
    
    // Refresh table and cart badge count
    renderAdminDashboard();
    
    // Also remove from cart if present
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('fruitingo_cart', JSON.stringify(cart));
    updateCartBadge();
}

// Add Product from admin form
function adminAddProduct(e) {
    e.preventDefault();

    const name = document.getElementById('new-prod-name').value.trim();
    const price = parseInt(document.getElementById('new-prod-price').value);
    const weight = document.getElementById('new-prod-weight').value.trim();
    const desc = document.getElementById('new-prod-desc').value.trim();
    const tag = document.getElementById('new-prod-tag').value.trim();
    const imageSelect = document.getElementById('new-prod-image').value;

    if (!name || !price || !weight) return;

    // Generate unique ID
    const id = 'fruitingo-' + Date.now();

    const newProduct = {
        id,
        name,
        price,
        weight,
        desc: desc || '100% pure organic Nendran banana powder. Sourced directly from farms, sun-dried and finely ground.',
        image: imageSelect || 'assets/fruitingo_product.jpg',
        rating: 5.0,
        reviewsCount: 1,
        tag: tag || 'New'
    };

    products.push(newProduct);
    localStorage.setItem('fruitingo_products', JSON.stringify(products));

    // Clear form
    document.getElementById('admin-add-form').reset();

    // Re-render
    renderAdminDashboard();

    // Alert success
    alert('Product added successfully!');
}
