// ===========================
// QUICKBITE - script.js
// ===========================


// ── 1. MOBILE HAMBURGER MENU ──────────────────────────────────────────────────

const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('nav');

hamburger.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
    hamburger.classList.toggle('open');
});

// Close nav when a link is clicked (mobile)
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburger.classList.remove('open');
    });
});


// ── 2. ACTIVE NAV LINK ON SCROLL ─────────────────────────────────────────────

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });

    // Show/hide floating cart button
    const floatCart = document.getElementById('float-cart-btn');
    floatCart.style.opacity = window.scrollY > 300 ? '1' : '0';
    floatCart.style.pointerEvents = window.scrollY > 300 ? 'auto' : 'none';
});


// ── 3. SCROLL-REVEAL ANIMATIONS ───────────────────────────────────────────────

const revealElements = document.querySelectorAll(
    '.food-card, .offers-card, .menu-box, .why-us li, .form'
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealElements.forEach(el => {
    el.classList.add('hidden-init');
    observer.observe(el);
});


// ── 4. CART SYSTEM ────────────────────────────────────────────────────────────

let cart = [];

function getCartItemKey(name) {
    return name.trim().toLowerCase();
}

function addToCart(name, price) {
    const key = getCartItemKey(name);
    const existing = cart.find(i => getCartItemKey(i.name) === key);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    showToast(`${name} added to cart!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    renderCartItems();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'flex' : 'none';
    });
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart">Your cart is empty 🍽️</p>`;
        totalEl.textContent = '₹0';
        return;
    }

    container.innerHTML = cart.map((item, i) => `
        <div class="cart-row">
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">₹${item.price * item.qty}</span>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${i})">✕</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    totalEl.textContent = `₹${total}`;
}

// Cart modal open/close
document.getElementById('cart-icon-btn').addEventListener('click', openCart);
document.getElementById('float-cart-btn').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

function openCart() {
    renderCartItems();
    document.getElementById('cart-modal').classList.add('cart-open');
    document.getElementById('cart-overlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cart-modal').classList.remove('cart-open');
    document.getElementById('cart-overlay').style.display = 'none';
    document.body.style.overflow = '';
}

// Checkout button
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Add some items first!', 'error');
        return;
    }
    closeCart();
    // Pre-fill the select dropdown with first item
    const select = document.querySelector('.form select');
    if (select && cart[0]) {
        // Try to match, else leave
        const optionMatch = [...select.options].find(o =>
            o.text.toLowerCase().includes(cart[0].name.toLowerCase().split(' ')[0])
        );
        if (optionMatch) select.value = optionMatch.value;
    }
    updateFormSummary();
    document.querySelector('.form').scrollIntoView({ behavior: 'smooth' });
    showToast('Fill in your details below to complete!', 'info');
});


// ── 5. DYNAMIC "ADD TO CART" BUTTONS ─────────────────────────────────────────

// Trending food cards
document.querySelectorAll('.food-card').forEach(card => {
    const name = card.querySelector('h3').textContent.trim();
    const priceText = card.querySelector('p').textContent.trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    const btn = document.createElement('button');
    btn.textContent = '+ Add to Cart';
    btn.className = 'add-btn';
    btn.addEventListener('click', () => addToCart(name, price));
    card.appendChild(btn);
});

// Menu items
document.querySelectorAll('.menu-item').forEach(item => {
    const name = item.querySelector('span:first-child').textContent.trim();
    const priceText = item.querySelector('span:last-child').textContent.trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    const btn = document.createElement('button');
    btn.textContent = '+';
    btn.className = 'menu-add-btn';
    btn.title = `Add ${name} to cart`;
    btn.addEventListener('click', () => addToCart(name, price));
    item.appendChild(btn);
});


/// ── ORDER FORM SUMMARY (populate from cart) ───────────────────

function updateFormSummary() {
    const container = document.getElementById('form-cart-items');
    const subtotalEl = document.getElementById('form-subtotal');
    const totalEl = document.getElementById('form-total');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="summary-empty">No items yet — add from the menu above!</p>`;
        subtotalEl.textContent = '₹0';
        totalEl.textContent = '₹0';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="form-cart-item-row">
            <span class="summary-item-name">${item.name}</span>
            <span class="summary-item-qty">×${item.qty}</span>
            <span class="summary-item-price">₹${item.price * item.qty}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    subtotalEl.textContent = `₹${total}`;
    totalEl.textContent = `₹${total}`;
}

// ── FORM VALIDATION ───────────────────────────────────────────

const orderForm = document.getElementById('order-form');

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('f-name');
    const phone   = document.getElementById('f-phone');
    const address = document.getElementById('f-address');

    let valid = true;

    orderForm.querySelectorAll('.error-msg').forEach(el => el.remove());
    orderForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    function showError(input, msg) {
        input.classList.add('input-error');
        const err = document.createElement('span');
        err.className = 'error-msg';
        err.textContent = msg;
        input.insertAdjacentElement('afterend', err);
        valid = false;
    }

    if (cart.length === 0)      { showToast('Your cart is empty!', 'error'); return; }
    if (!name.value.trim())     showError(name, 'Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone.value.trim())) showError(phone, 'Enter a valid 10-digit Indian mobile number.');
    if (!address.value.trim())  showError(address, 'Please enter your delivery address.');

    if (valid) {
        showToast('Order placed successfully! 🎉', 'success');
        orderForm.reset();
        cart = [];
        updateCartUI();
        updateFormSummary();
    }
});

// Phone: digits only
document.getElementById('f-phone').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
});


// ── 7. TOAST NOTIFICATIONS ────────────────────────────────────────────────────

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}


// ── 8. HERO BUTTON SMOOTH SCROLL ─────────────────────────────────────────────

document.querySelector('.hero button').addEventListener('click', () => {
    document.querySelector('#Menu').scrollIntoView({ behavior: 'smooth' });
});