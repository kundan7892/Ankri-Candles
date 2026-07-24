/**
 * Product Detail Page (PDP) Modal — Stitch Design System
 * Handles: open/close, gallery, qty stepper, accordions, cart, wishlist
 */

// ── Candle Product Catalogue ──────────────────────────────────────────────
export const CANDLE_CATALOGUE = [
    {
        id: 'santal-noir',
        name: 'Santal Noir',
        price: 1299,
        tags: ['Woody', 'Spicy'],
        description:
            'A deeply resonant fragrance that captures the essence of a quiet study at midnight. Rich sandalwood and dry cedar are softened by subtle whispers of vanilla and cracked black pepper.',
        images: [
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
        ],
        notes: [
            { label: 'Top', value: 'Black Pepper, Cardamom' },
            { label: 'Middle', value: 'Sandalwood, Papyrus' },
            { label: 'Base', value: 'Cedarwood, Vanilla, Amber' },
        ],
        details: [
            'Weight: 220g | Burn time: ~50 hours',
            'Container: Frosted amber glass jar',
            'Wax: 100% natural soy wax blend',
            'Trim wick to 5mm before each burn',
            'Keep away from drafts and direct sunlight',
        ],
    },
    {
        id: 'midnight-fig',
        name: 'Midnight Fig',
        price: 1099,
        tags: ['Fruity', 'Deep'],
        description:
            'Rich, ripe fig wrapped in dark musks and a whisper of blackcurrant. An intimate evening fragrance that lingers long after the flame is extinguished.',
        images: [
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
        ],
        notes: [
            { label: 'Top', value: 'Blackcurrant, Fig Leaf' },
            { label: 'Middle', value: 'Fig, Plum' },
            { label: 'Base', value: 'Dark Musk, Vetiver' },
        ],
        details: [
            'Weight: 200g | Burn time: ~45 hours',
            'Container: Dark violet glass jar',
            'Wax: 100% natural soy wax blend',
            'Trim wick to 5mm before each burn',
        ],
    },
    {
        id: 'white-linen',
        name: 'White Linen',
        price: 999,
        tags: ['Fresh', 'Airy'],
        description:
            'Crisp, sunlit linen drying in a coastal breeze. Clean aldehydes and soft florals conjure the perfect lazy Sunday morning.',
        images: [
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
        ],
        notes: [
            { label: 'Top', value: 'Aldehydes, Bergamot' },
            { label: 'Middle', value: 'White Rose, Jasmine' },
            { label: 'Base', value: 'Clean Musks, Cedar' },
        ],
        details: [
            'Weight: 180g | Burn time: ~40 hours',
            'Container: Matte white ceramic jar',
            'Wax: 100% natural soy wax blend',
        ],
    },
    {
        id: 'bergamot-vetiver',
        name: 'Bergamot Vetiver',
        price: 1199,
        tags: ['Citrus', 'Smoky'],
        description:
            'Citrus and smoky vetiver in an unexpected harmony. Bright bergamot opens slowly into deep, earthy vetiver — complex, alluring, layered.',
        images: [
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
            'luxury_candles_banner.png',
        ],
        notes: [
            { label: 'Top', value: 'Bergamot, Pink Pepper' },
            { label: 'Middle', value: 'Vetiver, Tobacco' },
            { label: 'Base', value: 'Oakmoss, Patchouli' },
        ],
        details: [
            'Weight: 210g | Burn time: ~48 hours',
            'Container: Smoked amber glass jar',
            'Wax: 100% natural soy wax blend',
        ],
    },
];

// ── DOM References ────────────────────────────────────────────────────────
const overlay = document.getElementById('product-detail-modal');
const closeBtn = document.getElementById('pdp-close-btn');
const mainImg = document.getElementById('pdp-main-img');
const thumbsWrap = document.getElementById('pdp-thumbs');
const tagsWrap = document.getElementById('pdp-tags');
const titleEl = document.getElementById('pdp-title');
const breadcrumbName = document.getElementById('pdp-breadcrumb-name');
const priceEl = document.getElementById('pdp-price');
const descEl = document.getElementById('pdp-desc');
const qtyVal = document.getElementById('pdp-qty-val');
const qtyMinus = document.getElementById('pdp-qty-minus');
const qtyPlus = document.getElementById('pdp-qty-plus');
const addToCartBtn = document.getElementById('pdp-add-to-cart');
const wishlistBtn = document.getElementById('pdp-wishlist-btn');
const notesList = document.getElementById('pdp-notes-list');
const detailsList = document.getElementById('pdp-details-list');

let currentProduct = null;
let currentQty = 1;
let isWishlisted = false;

// ── Open the PDP ─────────────────────────────────────────────────────────
export function openPDP(productIdOrObj) {
    let product;
    if (typeof productIdOrObj === 'string') {
        product = CANDLE_CATALOGUE.find(p => p.id === productIdOrObj);
    } else {
        // Accept a plain object with at least { name, price, description }
        product = productIdOrObj;
    }
    if (!product) return;

    currentProduct = product;
    currentQty = 1;
    isWishlisted = false;

    // Populate content
    populate(product);

    // Show overlay
    overlay.classList.add('pdp-open');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;

    // Re-init Lucide icons inside modal
    if (window.lucide) window.lucide.createIcons();
}

// ── Close the PDP ─────────────────────────────────────────────────────────
export function closePDP() {
    overlay.classList.remove('pdp-open');
    document.body.style.overflow = '';
}

// ── Populate modal with product data ─────────────────────────────────────
function populate(p) {
    // Title + breadcrumb
    titleEl.textContent = p.name;
    breadcrumbName.textContent = p.name;

    // Price (support both number and string)
    const priceNum = typeof p.price === 'number' ? p.price : parseInt(p.price, 10);
    priceEl.textContent = isNaN(priceNum) ? p.price : `₹${priceNum.toLocaleString('en-IN')}`;

    // Description
    descEl.textContent = p.description || '';

    // Tags
    tagsWrap.innerHTML = '';
    (p.tags || []).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'pdp-tag';
        span.textContent = tag;
        tagsWrap.appendChild(span);
    });

    // Gallery
    const images = p.images && p.images.length ? p.images : ['luxury_candles_banner.png'];
    mainImg.src = images[0];
    mainImg.alt = p.name;

    thumbsWrap.innerHTML = '';
    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = `pdp-thumb${i === 0 ? ' active' : ''}`;
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${p.name} view ${i + 1}`;
        div.appendChild(img);
        div.addEventListener('click', () => {
            mainImg.src = src;
            thumbsWrap.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
            div.classList.add('active');
        });
        thumbsWrap.appendChild(div);
    });

    // Quantity reset
    currentQty = 1;
    qtyVal.textContent = '1';

    // Fragrance Notes
    if (notesList) {
        notesList.innerHTML = '';
        (p.notes || []).forEach(n => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${n.label}:</strong> ${n.value}`;
            notesList.appendChild(li);
        });
    }

    // Details
    if (detailsList) {
        detailsList.innerHTML = '';
        (p.details || []).forEach(d => {
            const li = document.createElement('li');
            li.textContent = d;
            detailsList.appendChild(li);
        });
    }

    // Reset wishlist state
    wishlistBtn.classList.remove('wishlisted');
    isWishlisted = false;

    // Close all accordions
    document.querySelectorAll('.pdp-accordion-item').forEach(item => {
        item.classList.remove('open');
        const btn = item.querySelector('.pdp-accordion-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

// ── Quantity stepper ──────────────────────────────────────────────────────
qtyMinus?.addEventListener('click', () => {
    if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
    }
});

qtyPlus?.addEventListener('click', () => {
    currentQty++;
    qtyVal.textContent = currentQty;
});

// ── Add to Cart ───────────────────────────────────────────────────────────
addToCartBtn?.addEventListener('click', () => {
    if (!currentProduct) return;

    // Try to use existing cart system if available
    if (typeof window.addToCart === 'function') {
        window.addToCart({
            name: currentProduct.name,
            price: currentProduct.price,
            qty: currentQty,
            image: currentProduct.images?.[0] || '',
        });
    } else {
        // Fallback: dispatch a custom event that main.js can listen to
        document.dispatchEvent(new CustomEvent('pdp:add-to-cart', {
            detail: {
                name: currentProduct.name,
                price: currentProduct.price,
                qty: currentQty,
                image: currentProduct.images?.[0] || '',
                scent: currentProduct.name,
            }
        }));
    }

    // Visual feedback
    addToCartBtn.textContent = 'Added ✓';
    addToCartBtn.style.background = '#4a6458';
    setTimeout(() => {
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.style.background = '';
    }, 2000);
});

// ── Wishlist toggle ───────────────────────────────────────────────────────
wishlistBtn?.addEventListener('click', () => {
    isWishlisted = !isWishlisted;
    wishlistBtn.classList.toggle('wishlisted', isWishlisted);
    const icon = wishlistBtn.querySelector('svg');
    if (icon) {
        icon.style.fill = isWishlisted ? '#e53e3e' : 'none';
        icon.style.stroke = isWishlisted ? '#e53e3e' : 'currentColor';
    }
});

// ── Share ─────────────────────────────────────────────────────────────────
document.getElementById('pdp-share-btn')?.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: `Ankri Candle — ${currentProduct?.name}`,
            text: currentProduct?.description,
            url: window.location.href,
        }).catch(() => { });
    } else {
        navigator.clipboard?.writeText(window.location.href);
    }
});

// ── Accordions ────────────────────────────────────────────────────────────
document.querySelectorAll('.pdp-accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.pdp-accordion-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.pdp-accordion-item').forEach(i => {
            i.classList.remove('open');
            i.querySelector('.pdp-accordion-btn')?.setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

// ── Close handlers ────────────────────────────────────────────────────────
closeBtn?.addEventListener('click', closePDP);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('pdp-open')) {
        closePDP();
    }
});

// ── Expose globally so main.js and inline onclick can call openPDP ─────────
window.openPDP = openPDP;
window.closePDP = closePDP;
window.CANDLE_CATALOGUE = CANDLE_CATALOGUE;
