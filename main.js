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
    initWhyChooseReveal();
    
    // Dynamic Page Render Initializations
    if (document.getElementById('products-container')) {
        renderProductsHome();
    }
    if (document.getElementById('admin-products-table')) {
        renderAdminDashboard();
    }
    if (document.getElementById('admin-feedback-table')) {
        renderAdminFeedbacks();
    }
    if (document.getElementById('dynamic-reviews-grid')) {
        renderFeedbacks();
        initStarRating();
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

function initWhyChooseReveal() {
    const items = document.querySelectorAll('.why-choose-reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

    items.forEach((item) => observer.observe(item));
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
        
        const mrpHtml = p.strikePrice ? `<del style="color: var(--gray-muted); font-size: 0.85rem; font-weight: 500; margin-left: 0.5rem;">₹${p.strikePrice}</del>` : '';
        const nutritionHtml = p.nutrition ? `<p style="font-size: 0.8rem; color: var(--secondary); margin-top: 0.5rem; font-weight: 600;"><i class="fa-solid fa-leaf"></i> ${p.nutrition}</p>` : '';
        
        html += `
            <div class="product-card">
                <div class="product-image-wrap">
                    ${tagHTML}
                    <img src="${p.image}" alt="${p.name}" class="product-card-img">
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-title">${p.name}</h3>
                    <p class="product-card-desc" style="margin-bottom: 0.5rem;">${p.desc}</p>
                    ${nutritionHtml}
                    <div class="product-rating" style="margin-top: 1rem;">
                        ${starsHTML}
                        <span>${p.rating} (${p.reviewsCount} reviews)</span>
                    </div>
                    <div class="product-card-footer">
                        <div class="price-tag">₹${p.price} ${mrpHtml} <span style="display:block; font-size:0.75rem; margin-top:0.15rem;">/ ${p.weight}</span></div>
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
    products.forEach((p) => {
        let mrpHtml = p.strikePrice ? `₹${p.strikePrice}` : '-';
        html += `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); text-align: center;">
                    <img src="${p.image}" alt="${p.name}" style="width: 48px; height: 48px; object-fit: contain; background: var(--sand); border-radius: 8px;">
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 700; color: var(--chocolate);">${p.name}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${p.weight}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 800; color: var(--chocolate);">₹${p.price}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); color: var(--gray-muted);"><del>${mrpHtml}</del></td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); text-align: center; white-space: nowrap;">
                    <button onclick="editProduct('${p.id}')" style="background: transparent; border: none; color: var(--primary); cursor: pointer; font-size: 1.1rem; padding: 0.5rem; transition: var(--transition-fast);" title="Edit Product">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
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
window.adminDeleteProduct = function(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    products = products.filter(p => p.id !== id);
    localStorage.setItem('fruitingo_products', JSON.stringify(products));
    
    renderAdminDashboard();
    
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('fruitingo_cart', JSON.stringify(cart));
    updateCartBadge();
};

// Edit Product
window.editProduct = function(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('form-title').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i> Edit Package';
    document.getElementById('edit-prod-id').value = p.id;
    
    document.getElementById('new-prod-name').value = p.name;
    document.getElementById('new-prod-price').value = p.price;
    document.getElementById('new-prod-strike-price').value = p.strikePrice || '';
    document.getElementById('new-prod-weight').value = p.weight;
    document.getElementById('new-prod-desc').value = p.desc || '';
    document.getElementById('new-prod-nutrition').value = p.nutrition || '';
    
    // Reset file input since we can't set it programmatically
    document.getElementById('new-prod-image').value = '';
    
    document.getElementById('form-submit-btn').innerHTML = '<i class="fa-solid fa-save"></i> Update Product';
    document.getElementById('form-cancel-btn').style.display = 'flex';
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelEdit = function() {
    document.getElementById('admin-add-form').reset();
    document.getElementById('edit-prod-id').value = '';
    document.getElementById('form-title').innerHTML = '<i class="fa-solid fa-circle-plus" style="color: var(--secondary);"></i> Add New Package';
    document.getElementById('form-submit-btn').innerHTML = '<i class="fa-solid fa-save"></i> Save & Publish Product';
    document.getElementById('form-cancel-btn').style.display = 'none';
};

// Add / Update Product from admin form
window.adminAddProduct = function(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-prod-id').value;
    const name = document.getElementById('new-prod-name').value.trim();
    const price = parseInt(document.getElementById('new-prod-price').value);
    const strikePriceRaw = document.getElementById('new-prod-strike-price').value;
    const strikePrice = strikePriceRaw ? parseInt(strikePriceRaw) : null;
    const weight = document.getElementById('new-prod-weight').value.trim();
    const desc = document.getElementById('new-prod-desc').value.trim();
    const nutrition = document.getElementById('new-prod-nutrition').value.trim();
    const imageInput = document.getElementById('new-prod-image');

    if (!name || !price || !weight) return;

    const saveOrUpdateProduct = (imgDataUrl) => {
        if (editId) {
            // Update existing
            const idx = products.findIndex(p => p.id === editId);
            if (idx > -1) {
                products[idx].name = name;
                products[idx].price = price;
                products[idx].strikePrice = strikePrice;
                products[idx].weight = weight;
                products[idx].desc = desc;
                products[idx].nutrition = nutrition;
                if (imgDataUrl) {
                    products[idx].image = imgDataUrl; // update image only if new one uploaded
                }
            }
            alert('Product updated successfully!');
        } else {
            // Add new
            const id = 'fruitingo-' + Date.now();
            const newProduct = {
                id,
                name,
                price,
                strikePrice,
                weight,
                desc: desc || '100% pure organic Nendran banana powder.',
                nutrition: nutrition || '',
                image: imgDataUrl || 'assets/fruitingo_product.jpg',
                rating: 5.0,
                reviewsCount: 1
            };
            products.push(newProduct);
            alert('Product added successfully!');
        }

        localStorage.setItem('fruitingo_products', JSON.stringify(products));
        cancelEdit();
        renderAdminDashboard();
    };

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            saveOrUpdateProduct(evt.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveOrUpdateProduct(null);
    }
}

// User Feedback Logic — stored in local database (localStorage)
if (!localStorage.getItem('fruitingo_reviews_v2')) {
    localStorage.removeItem('fruitingo_reviews');
    localStorage.setItem('fruitingo_reviews_v2', '1');
}

let reviews = JSON.parse(localStorage.getItem('fruitingo_reviews')) || [];

function saveReviews() {
    localStorage.setItem('fruitingo_reviews', JSON.stringify(reviews));
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sortedReviews() {
    return reviews.slice().sort((a, b) => {
        const pinDiff = Number(!!b.pinned) - Number(!!a.pinned);
        if (pinDiff !== 0) return pinDiff;
        return (b.createdAt || 0) - (a.createdAt || 0);
    });
}

window.renderFeedbacks = function() {
    const grid = document.getElementById('dynamic-reviews-grid');
    if (!grid) return;

    const list = sortedReviews();

    if (list.length === 0) {
        grid.style.display = 'block';
        grid.innerHTML = '<p class="reviews-empty">No customer feedback yet. Be the first to share your experience.</p>';
        return;
    }

    grid.style.display = 'grid';

    let html = '';
    list.forEach(r => {
        html += `
            <div class="review-card${r.pinned ? ' pinned' : ''}">
                ${r.pinned ? '<span class="review-pin-badge"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' : ''}
                <div class="review-stars">
                    ${getRatingStarsHTML(r.rating)}
                </div>
                <p class="review-text">"${escapeHtml(r.text)}"</p>
                <div class="review-user">
                    <div class="user-avatar">${escapeHtml(r.avatar)}</div>
                    <div class="user-details">
                        <h4>${escapeHtml(r.name)}</h4>
                        <p>${escapeHtml(r.role)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
};

window.submitFeedback = function(e) {
    e.preventDefault();
    const name = document.getElementById('fb-name').value.trim();
    const role = document.getElementById('fb-role').value.trim();
    const rating = parseInt(document.getElementById('fb-rating').value);
    const text = document.getElementById('fb-text').value.trim();
    
    if (!name || !role || !text) return;
    
    const avatar = name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
    
    const newReview = {
        id: 'fb-' + Date.now(),
        name,
        role,
        rating,
        text,
        avatar,
        pinned: false,
        createdAt: Date.now()
    };
    reviews.unshift(newReview);
    saveReviews();
    
    document.getElementById('feedback-form').reset();
    
    // Reset stars to 5 visually
    const stars = document.querySelectorAll('#star-rating-widget i');
    if (stars) {
        stars.forEach(s => {
            s.classList.remove('fa-regular');
            s.classList.add('fa-solid');
            s.style.color = 'var(--primary)';
        });
        document.getElementById('fb-rating').value = 5;
    }
    
    renderFeedbacks();
    alert('Thank you for your feedback!');
};

window.renderAdminFeedbacks = function() {
    const tableBody = document.getElementById('admin-feedback-table');
    const totalCount = document.getElementById('admin-total-feedback');
    if (!tableBody) return;

    if (totalCount) {
        totalCount.textContent = reviews.length;
    }

    if (reviews.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-muted);">
                    No feedback submitted yet.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    sortedReviews().forEach(r => {
        const date = r.createdAt ? new Date(r.createdAt).toLocaleString() : '—';
        html += `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                    ${r.pinned ? '<span class="stats-badge" style="background-color: rgba(212, 175, 55, 0.18); color: var(--chocolate);"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' : '<span style="color: var(--gray-muted); font-size: 0.85rem;">—</span>'}
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                    <strong style="color: var(--chocolate);">${escapeHtml(r.name)}</strong><br>
                    <span style="font-size: 0.8rem; color: var(--gray-muted);">${escapeHtml(r.role)}</span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); color: #FBBF24; white-space: nowrap;">${getRatingStarsHTML(r.rating)}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); max-width: 360px;">${escapeHtml(r.text)}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.8rem; color: var(--gray-muted); white-space: nowrap;">${date}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color); text-align: center; white-space: nowrap;">
                    <button onclick="togglePinFeedback('${r.id}')" style="background: transparent; border: none; color: var(--primary); cursor: pointer; font-size: 1.1rem; padding: 0.5rem;" title="${r.pinned ? 'Unpin feedback' : 'Pin feedback'}">
                        <i class="fa-solid ${r.pinned ? 'fa-thumbtack' : 'fa-map-pin'}"></i>
                    </button>
                    <button onclick="adminDeleteFeedback('${r.id}')" style="background: transparent; border: none; color: #EF4444; cursor: pointer; font-size: 1.1rem; padding: 0.5rem;" title="Delete feedback">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
};

window.togglePinFeedback = function(id) {
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return;
    reviews[idx].pinned = !reviews[idx].pinned;
    saveReviews();
    renderAdminFeedbacks();
    renderFeedbacks();
};

window.adminDeleteFeedback = function(id) {
    if (!confirm('Delete this feedback? This cannot be undone.')) return;
    reviews = reviews.filter(r => r.id !== id);
    saveReviews();
    renderAdminFeedbacks();
    renderFeedbacks();
};

// Interactive Star Rating for form
window.initStarRating = function() {
    const starWidget = document.getElementById('star-rating-widget');
    if (!starWidget) return;
    
    const stars = starWidget.querySelectorAll('i');
    const ratingInput = document.getElementById('fb-rating');
    
    // Initialize stars to Gold
    stars.forEach(s => s.style.color = 'var(--primary)');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-val'));
            ratingInput.value = val;
            
            // Update visuals
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-val'));
                if (sVal <= val) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                }
            });
        });
    });
};
