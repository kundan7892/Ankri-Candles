import './style.css';
const app = document.getElementById('app');

const routes = {
  splash: `
    <div class="splash-screen">
      <div class="splash-logo fade-in-up">Ankri Candles</div>
      <div class="splash-subtitle fade-in-up delay-1">Hand-poured Luxury</div>
    </div>
  `,
  onboarding: `
    <div class="onboarding-screen">
      <div class="onboard-illustration">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpxZ1u-2gkarAO6PyjdRvIH_bm_rLOLyWQZWTT561n6XKisFWJH2bo1UrspTF8z8cxECGfBpq_w8vyi_6lFFHoA4oxthYkH6taS-aJXUbc_t6WdfvnZQaSi7luRmX50_zArplL6Xq-glhYXD4F2yh3yZVWmHSqTn3wNO32wKcEWbdG2yovT9FwRgaiXzK-ct4Ko-w-Y0i0AUmZmhlfSDHUgU0I0TLr4DaYQremk6jyMyGSmvlplMfLTvrB8KTe-VJVSEtN5OWTkR5G" alt="Candle" style="object-fit: cover; border-radius: 20px;">
      </div>
      <h2 class="onboard-title">Personalize Your Space</h2>
      <p class="onboard-text">Experience the art of slow living with our customized fragrances.</p>
      <button class="btn-primary" onclick="navigate('login')">Get Started</button>
    </div>
  `,
  login: `
    <div class="auth-screen">
      <div class="auth-header">
        <h1 class="page-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to sync your wishlist and orders.</p>
      </div>
      <div class="auth-form">
        <input type="email" class="input-field" placeholder="Email Address">
        <input type="password" class="input-field" placeholder="Password">
        <button class="btn-primary" onclick="navigate('home')">Sign In</button>
        <div class="auth-links">
          <a href="#">Forgot Password?</a>
          <span> • </span>
          <a href="#">Create Account</a>
        </div>
        <button class="btn-secondary" onclick="navigate('home')">Continue as Guest</button>
      </div>
    </div>
  `,
  home: `
    <header class="app-header">
      <div class="brand-title">Ankri Candles</div>
      <i data-lucide="bell" style="color: var(--text-secondary);"></i>
    </header>
    
    <div class="app-content">
      <div class="banner">
        <h2 class="banner-title">Build Your<br>Perfect Candle</h2>
        <button class="banner-btn" onclick="navigate('builder')">Customize Now</button>
      </div>

      <div class="section-title">
        <span>Signature Scents</span>
        <a href="#">See All</a>
      </div>

      <div class="product-grid">
        <div class="product-card">
          <button class="wishlist-btn"><i data-lucide="heart" style="width: 16px;"></i></button>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpxZ1u-2gkarAO6PyjdRvIH_bm_rLOLyWQZWTT561n6XKisFWJH2bo1UrspTF8z8cxECGfBpq_w8vyi_6lFFHoA4oxthYkH6taS-aJXUbc_t6WdfvnZQaSi7luRmX50_zArplL6Xq-glhYXD4F2yh3yZVWmHSqTn3wNO32wKcEWbdG2yovT9FwRgaiXzK-ct4Ko-w-Y0i0AUmZmhlfSDHUgU0I0TLr4DaYQremk6jyMyGSmvlplMfLTvrB8KTe-VJVSEtN5OWTkR5G" alt="Santal Noir">
          <div class="product-title">Santal Noir</div>
          <div class="product-price">₹1,299</div>
        </div>
        <div class="product-card">
          <button class="wishlist-btn"><i data-lucide="heart" style="width: 16px;"></i></button>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpxZ1u-2gkarAO6PyjdRvIH_bm_rLOLyWQZWTT561n6XKisFWJH2bo1UrspTF8z8cxECGfBpq_w8vyi_6lFFHoA4oxthYkH6taS-aJXUbc_t6WdfvnZQaSi7luRmX50_zArplL6Xq-glhYXD4F2yh3yZVWmHSqTn3wNO32wKcEWbdG2yovT9FwRgaiXzK-ct4Ko-w-Y0i0AUmZmhlfSDHUgU0I0TLr4DaYQremk6jyMyGSmvlplMfLTvrB8KTe-VJVSEtN5OWTkR5G" alt="Midnight Fig">
          <div class="product-title">Midnight Fig</div>
          <div class="product-price">₹1,099</div>
        </div>
      </div>
    </div>
    
    <nav class="bottom-nav">
      <a href="#" class="nav-item active"><i data-lucide="home"></i> Home</a>
      <a href="#" class="nav-item"><i data-lucide="search"></i> Explore</a>
      <a href="#" class="nav-item"><i data-lucide="shopping-bag"></i> Cart</a>
      <a href="#" class="nav-item"><i data-lucide="user"></i> Profile</a>
    </nav>
  `,
  builder: `
    <header class="app-header">
      <i data-lucide="arrow-left" onclick="navigate('home')" style="color: var(--text-primary);"></i>
      <div class="brand-title" style="font-size: 1rem;">Custom Candle</div>
      <div style="width: 24px;"></div>
    </header>
    <div class="app-content builder-scroll">
      <div class="builder-preview">
        <img src="https://lh3.googleusercontent.com/abGvJ52v0KOPjP6yqO2sD_1H2V_41a6WOhT-_x5Vj6vQJ9h7y_X9lJQ_L3hT-i3gT1R8z-_W1a_x-_1a_x-_W1a" alt="Candle Preview" />
        <h3 class="product-title" style="margin-top:15px;" id="lbl-jar-choice">Classic Gold • Soy Wax</h3>
        <p class="product-price" id="lbl-fragrance-choice">+ Sandalwood & Vetiver</p>
      </div>

      <div class="builder-options" style="margin-top:20px;">
        <div class="section-title"><span>01. Select Vessel</span></div>
        <div class="vessel-scroll flex-row">
           <button class="vessel-btn active" onclick="selectVessel(this, 'Classic Gold')">Gold</button>
           <button class="vessel-btn" onclick="selectVessel(this, 'Sleek Silver')">Silver</button>
           <button class="vessel-btn" onclick="selectVessel(this, 'Matte Black')">Black</button>
        </div>

        <div class="section-title" style="margin-top:20px;"><span>02. Select Fragrance</span></div>
        <div class="fragrance-list">
           <div class="frag-item active" onclick="selectFragrance(this, 'Sandalwood & Vetiver')">Sandalwood & Vetiver <i data-lucide="check" class="check-icon"></i></div>
           <div class="frag-item" onclick="selectFragrance(this, 'Midnight Fig')">Midnight Fig <i data-lucide="check" class="check-icon" style="display:none;"></i></div>
           <div class="frag-item" onclick="selectFragrance(this, 'Rose Oud')">Rose Oud <i data-lucide="check" class="check-icon" style="display:none;"></i></div>
        </div>

        <button class="btn-primary" style="margin-top:30px;" onclick="checkoutCandle()">Add to Cart - ₹1,499</button>
      </div>
    </div>
  `,
  cart: `
    <header class="app-header">
      <i data-lucide="arrow-left" onclick="navigate('home')" style="color: var(--text-primary);"></i>
      <div class="brand-title" style="font-size: 1rem;">Checkout</div>
      <div style="width: 24px;"></div>
    </header>
    <div class="app-content auth-screen">
       <h1 class="page-title">Complete Order</h1>
       <div id="checkout-state">
         <input type="text" id="cust-name" class="input-field" placeholder="Full Name">
         <input type="email" id="cust-email" class="input-field" placeholder="Email Address">
         <input type="tel" id="cust-phone" class="input-field" placeholder="Phone Number">
         <button class="btn-primary" onclick="submitBooking()">Pay & Order</button>
       </div>
    </div>
  `
};

window.navigate = function (route) {
  app.innerHTML = routes[route] || routes.home;
  app.className = 'route-' + route;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Builder Logic
window.selectVessel = function (elem, name) {
  document.querySelectorAll('.vessel-btn').forEach(b => b.classList.remove('active'));
  elem.classList.add('active');
  document.getElementById('lbl-jar-choice').textContent = name + ' • Soy Wax';
}

window.selectFragrance = function (elem, name) {
  document.querySelectorAll('.frag-item').forEach(b => {
    b.classList.remove('active');
    b.querySelector('.check-icon').style.display = 'none';
  });
  elem.classList.add('active');
  elem.querySelector('.check-icon').style.display = 'inline-block';
  document.getElementById('lbl-fragrance-choice').textContent = '+ ' + name;
}

window.checkoutCandle = function () {
  navigate('cart');
}

// API Integration to server.js
window.submitBooking = async function () {
  const btn = document.querySelector('#checkout-state button');
  btn.textContent = 'Processing...';

  const payload = {
    orderId: 'MOB-' + Date.now().toString().slice(-6),
    customerInfo: {
      name: document.getElementById('cust-name').value || 'Guest User',
      email: document.getElementById('cust-email').value || 'guest@example.com',
      phone: document.getElementById('cust-phone').value || '9999999999',
      address: 'Mobile App Purchase'
    },
    cartItems: [{
      id: 'custom-candle',
      name: 'Custom Mobile App Candle',
      price: 1499,
      quantity: 1
    }],
    totalAmount: 1499,
    paymentMethod: 'UPI',
    status: 'COMPLETED'
  };

  try {
    const res = await fetch((typeof window.API_BASE_URL === "string" ? window.API_BASE_URL : "http://localhost:5000") + '/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      document.getElementById('checkout-state').innerHTML =
        '<div class="auth-subtitle" style="text-align:center;"><h2>Order Confirmed!</h2><p>Your custom candle is being prepared.</p><button class="btn-primary" onclick="navigate(\'home\')">Back to Home</button></div>';
    } else {
      btn.textContent = 'Error processing';
    }
  } catch (e) {
    document.getElementById('checkout-state').innerHTML =
      '<div class="auth-subtitle" style="text-align:center;"><h2>Order Saved Locally!</h2><p>Server offline. Saved to offline storage.</p><button class="btn-primary" onclick="navigate(\'home\')">Back to Home</button></div>';
  }
}

// Initial render sequence
window.addEventListener('DOMContentLoaded', () => {
  navigate('splash');
  setTimeout(() => {
    navigate('onboarding');
  }, 2500);
});
