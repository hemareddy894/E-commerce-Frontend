// Sample Products Data
const products = [
    { id: 1, name: 'Wireless Headphones', price: 89.99, category: 'electronics', rating: 4.5, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { id: 2, name: 'Smart Watch', price: 199.99, category: 'electronics', rating: 4.8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
    { id: 3, name: 'Leather Jacket', price: 149.99, category: 'fashion', rating: 4.3, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { id: 4, name: 'Running Shoes', price: 79.99, category: 'sports', rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { id: 5, name: 'Coffee Maker', price: 59.99, category: 'home', rating: 4.4, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400' },
    { id: 6, name: 'Backpack', price: 49.99, category: 'fashion', rating: 4.2, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
    { id: 7, name: 'Bluetooth Speaker', price: 45.99, category: 'electronics', rating: 4.7, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
    { id: 8, name: 'Yoga Mat', price: 29.99, category: 'sports', rating: 4.5, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400' },
    { id: 9, name: 'Table Lamp', price: 39.99, category: 'home', rating: 4.3, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
    { id: 10, name: 'Sunglasses', price: 69.99, category: 'fashion', rating: 4.6, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
    { id: 11, name: 'Laptop Stand', price: 34.99, category: 'electronics', rating: 4.4, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
    { id: 12, name: 'Dumbbell Set', price: 89.99, category: 'sports', rating: 4.8, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' }
];

// State
let currentUser = null;
let cart = [];
let filteredProducts = [...products];

// DOM Elements
const authPage = document.getElementById('authPage');
const shopPage = document.getElementById('shopPage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const productsGrid = document.getElementById('productsGrid');
const cartPanel = document.getElementById('cartPanel');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    setupEventListeners();
});

// Auth Toggle
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const formType = btn.dataset.form;
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${formType}Form`).classList.add('active');
    });
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        showError('loginEmail', 'Invalid email format');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast('Login successful!');
        setTimeout(() => {
            authPage.classList.remove('active');
            shopPage.classList.add('active');
            renderProducts();
        }, 1000);
    } else {
        showError('loginPassword', 'Invalid credentials');
    }
});

// Register
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    let isValid = true;
    
    if (name.length < 2) {
        showError('registerName', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('registerEmail', 'Invalid email format');
        isValid = false;
    }
    
    if (password.length < 8) {
        showError('registerPassword', 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (password !== confirm) {
        showError('registerConfirm', 'Passwords do not match');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        showError('registerEmail', 'Email already registered');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    showToast('Registration successful! Please login.');
    
    setTimeout(() => {
        document.querySelector('[data-form="login"]').click();
        registerForm.reset();
    }, 1500);
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('cartToggle').addEventListener('click', () => cartPanel.classList.add('open'));
    document.getElementById('closeCart').addEventListener('click', () => cartPanel.classList.remove('open'));
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('ratingFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

// Render Products
function renderProducts() {
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card glass">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3>${product.name}</h3>
                <div class="product-rating">${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('productCount').textContent = `${filteredProducts.length} products`;
}

// Apply Filters
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const rating = document.getElementById('ratingFilter').value;
    
    filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(search);
        const matchCategory = category === 'all' || product.category === category;
        
        let matchPrice = true;
        if (priceRange !== 'all') {
            if (priceRange === '200+') {
                matchPrice = product.price >= 200;
            } else {
                const [min, max] = priceRange.split('-').map(Number);
                matchPrice = product.price >= min && product.price <= max;
            }
        }
        
        const matchRating = rating === 'all' || product.rating >= Number(rating);
        
        return matchSearch && matchCategory && matchPrice && matchRating;
    });
    
    renderProducts();
}

// Reset Filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('ratingFilter').value = 'all';
    filteredProducts = [...products];
    renderProducts();
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    renderCart();
    showToast('Added to cart!');
}

// Render Cart
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; padding: 40px;">Your cart is empty</p>';
        cartCount.textContent = '0';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showToast('Removed from cart');
}

// Save/Load Cart
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    renderCart();
}

// Auth Helpers
function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        authPage.classList.remove('active');
        shopPage.classList.add('active');
        renderProducts();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    cart = [];
    saveCart();
    shopPage.classList.remove('active');
    authPage.classList.add('active');
    showToast('Logged out successfully');
}

// Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorMsg = input.nextElementSibling;
    input.classList.add('error');
    errorMsg.textContent = message;
    
    setTimeout(() => {
        input.classList.remove('error');
        errorMsg.textContent = '';
    }, 3000);
}

// Toast
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark');
    const icon = document.getElementById('themeToggle');
    icon.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
}
