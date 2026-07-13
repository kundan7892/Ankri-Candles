// main.js - Client-side Interactive Logic for Ankri Candles

function initAppFlow() {
  // --- PROCEDURAL ASMR AUDIO STATE ---
  let audioCtx = null;
  let crackleTimer = null;
  let mainGainNode = null;
  let rainSource = null;
  let rainGainNode = null;
  let droneOscillators = [];
  let droneGainNode = null;
  let rumbleSource = null;
  let rumbleGainNode = null;

  const audioState = {
    isMuted: true,
    activeSoundscape: 'crackle' // 'crackle' | 'rain' | 'zen'
  };

  // --- STATE SYSTEM ---
  const state = {
    customizer: {
      productType: 'glass-jar', // 'glass-jar' | 'refill' | 'travel-tin'
      vessel: 'gold', // 'gold' | 'silver' | 'black' | 'amber'
      scents: {
        heart: 'lavender',    // 60%
        depth: 'sandalwood',  // 30%
        twist: 'coffee'       // 10%
      },
      label: {
        title: 'SUNDAY COFFEE',
        scents: 'Lavender, Sandalwood & Coffee',
        font: 'serif', // 'serif' | 'sans'
        theme: 'warm-cream' // 'warm-cream' | 'midnight-black' | 'vintage-gold'
      },
      gifting: {
        enabled: false,
        wrap: 'forest-silk',
        message: ''
      },
      isLit: false,
      price: 799
    },
    cart: [],
    discount: 0, // e.g. 0.15 for 15%
    promoApplied: false
  };

  // --- DATA DICTIONARIES ---
  const SCENT_POOL = {
    lavender: { name: 'Lavender', color: '#D1C4E9', desc: 'Soft, floral, relaxing' },
    vanilla: { name: 'Vanilla', color: '#FFF9C4', desc: 'Creamy, sweet, comforting' },
    rose: { name: 'Rose', color: '#FFC0CB', desc: 'Deep, romantic, botanical' },
    sandalwood: { name: 'Sandalwood', color: '#DEB887', desc: 'Warm, woodsy, sacred' },
    'first-rain': { name: 'First Rain', color: '#AEC6CF', desc: 'Petrichor, fresh, earthy' },
    coffee: { name: 'Caramelised Coffee', color: '#6F4E37', desc: 'Rich, dark, energizing' },
    orange: { name: 'Orange', color: '#F5B041', desc: 'Zesty, citrusy, uplifting' },
    coconut: { name: 'Coconut', color: '#FFF8DC', desc: 'Warm, tropical, sweet' },
    chocolate: { name: 'Chocolate', color: '#3E2723', desc: 'Indulgent, cocoa, sweet' },
    lemongrass: { name: 'Lemongrass', color: '#DFFF00', desc: 'Crisp, zesty, purifying' },
    cinnamon: { name: 'Cinnamon', color: '#D2691E', desc: 'Spicy, festive, cozy' },
    pineapple: { name: 'Pineapple', color: '#F9E79F', desc: 'Tangy, tropical, vibrant' },
    clove: { name: 'Clove', color: '#A0522D', desc: 'Warm, spicy, complex' },
    'ylang-ylang': { name: 'Ylang Ylang', color: '#FFFFE0', desc: 'Sweet, floral, exotic' }
  };

  const VESSELS = {
    gold: 'Classic Gold',
    silver: 'Classic Silver',
    black: 'Shiny Black',
    amber: 'Warm Amber'
  };

  const QUIZ_QUESTIONS = [
    {
      id: 1,
      title: "What state of mind do you want to cultivate?",
      options: [
        { text: "Deep Calm & Unwinding", weights: { heart: 'lavender', depth: 'vanilla', twist: 'ylang-ylang' }, desc: "Perfect for bedtime reading." },
        { text: "Nostalgia & Cozy Comfort", weights: { heart: 'coffee', depth: 'cinnamon', twist: 'chocolate' }, desc: "Rainy days with hot cocoa." },
        { text: "Pure Focus & Purification", weights: { heart: 'first-rain', depth: 'sandalwood', twist: 'lemongrass' }, desc: "Centering energy for study and work." },
        { text: "Sweet Tropical Sunshine", weights: { heart: 'pineapple', depth: 'coconut', twist: 'orange' }, desc: "Bright, energetic, and vacation vibes." }
      ]
    },
    {
      id: 2,
      title: "Where will this custom candle live?",
      options: [
        { text: "The Bedside Sanctuary", weights: { heart: 'lavender', depth: 'rose', twist: 'vanilla' }, desc: "A soothing atmosphere before sleep." },
        { text: "The Welcoming Living Room", weights: { heart: 'sandalwood', depth: 'orange', twist: 'clove' }, desc: "Warm and inviting for everyone." },
        { text: "The Zen Bath/Spa Corner", weights: { heart: 'lemongrass', depth: 'first-rain', twist: 'ylang-ylang' }, desc: "Crisp, purifying, and uplifting." }
      ]
    },
    {
      id: 3,
      title: "Pick a sensory experience that draws you in:",
      options: [
        { text: "Wet soil after the first summer rain", weights: { heart: 'first-rain', depth: 'sandalwood', twist: 'clove' }, desc: "Earthy, nostalgic, and crisp." },
        { text: "A bustling artisan café at sunrise", weights: { heart: 'coffee', depth: 'vanilla', twist: 'cinnamon' }, desc: "Warm, rich, and roasted." },
        { text: "A fresh breeze in a rose conservatory", weights: { heart: 'rose', depth: 'lavender', twist: 'vanilla' }, desc: "Botanical, light, and relaxing." }
      ]
    }
  ];

  const QUIZ_RECOMMENDATIONS = [
    {
      profile: "monsoon-dew",
      title: "Monsoon Dew",
      description: "Inspired by the first rains curing the dry soils of Bangalore. A deeply crisp, purifying blend featuring fresh petrichor with grounding woods and a touch of lemongrass.",
      heart: 'first-rain',
      depth: 'sandalwood',
      twist: 'lemongrass',
      tag: "Earthy & Purifying"
    },
    {
      profile: "morning-cafe",
      title: "Morning Café",
      description: "A rich, roasting, nostalgic atmosphere. Warm caramelized coffee beans combined with sweet vanilla cream and a cozy cinnamon spice twist.",
      heart: 'coffee',
      depth: 'vanilla',
      twist: 'cinnamon',
      tag: "Cozy & Sweet"
    },
    {
      profile: "lavender-sanctuary",
      title: "Lavender Sanctuary",
      description: "A soothing floral sanctuary formulated to calm the nervous system. Restful lavender paired with comforting vanilla and exotic ylang-ylang.",
      heart: 'lavender',
      depth: 'vanilla',
      twist: 'ylang-ylang',
      tag: "Deep Calm"
    }
  ];

  // --- DOM SELECTORS ---
  // Flame Toggle
  const flameSystem = document.getElementById('preview-flame-system');
  const interactiveFlame = document.getElementById('interactive-flame');
  const flameStatus = document.getElementById('flame-status');
  const flameToggleHint = document.getElementById('flame-toggle-hint');

  // Candle Jar Visual Elements
  const jarElement = document.getElementById('jar-element');
  const currentJarName = document.getElementById('current-jar-name');
  const waxTwistVisual = document.getElementById('wax-twist-visual');
  const waxHeartVisual = document.getElementById('wax-heart-visual');
  const waxDepthVisual = document.getElementById('wax-depth-visual');
  const vesselSwatchesWrapper = document.getElementById('vessel-swatches-wrapper');
  const refillVesselNotice = document.getElementById('refill-vessel-notice');
  const tinVesselNotice = document.getElementById('tin-vessel-notice');

  // Customizer Swatch Display
  const swatchBandTwist = document.getElementById('swatch-band-twist');
  const swatchBandHeart = document.getElementById('swatch-band-heart');
  const swatchBandDepth = document.getElementById('swatch-band-depth');

  // Label Visual Elements
  const previewLabelTitle = document.getElementById('preview-label-title');
  const previewLabelScents = document.getElementById('preview-label-scents');
  const jarLabelElement = document.getElementById('jar-label-element');

  // Step Tabs Navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  const stepContents = document.querySelectorAll('.config-step-content');

  // Dropdown Selectors
  const scentSelectHeart = document.getElementById('scent-select-heart');
  const scentSelectDepth = document.getElementById('scent-select-depth');
  const scentSelectTwist = document.getElementById('scent-select-twist');

  // Label Settings Form
  const labelInputTitle = document.getElementById('label-input-title');
  const labelInputScents = document.getElementById('label-input-scents');
  const fontBtns = document.querySelectorAll('.font-btn');
  const themeBtns = document.querySelectorAll('.theme-btn');

  // Cart elements
  const addCustomCandleBtn = document.getElementById('add-custom-candle-btn');
  const cartBtn = document.getElementById('cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartShippingFee = document.getElementById('cart-shipping-fee');
  const cartTotal = document.getElementById('cart-total');
  const cartCount = document.getElementById('cart-count');
  const promoInput = document.getElementById('promo-input');
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartFooter = document.getElementById('cart-footer');

  // Checkout Modal
  const checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
  const closeCheckoutModalBtn = document.getElementById('close-checkout-modal-btn');
  const checkoutDetailsForm = document.getElementById('checkout-details-form');

  // Success Modal
  const successModalOverlay = document.getElementById('success-modal-overlay');
  const orderNumberText = document.getElementById('order-number');
  const closeSuccessBtn = document.getElementById('close-success-btn');
  const successTitle = document.getElementById('success-title');
  const successDesc = document.getElementById('success-desc');
  const orderIdLabel = document.getElementById('order-id-label');

  // Toast
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  // Scent Finder Quiz Elements
  const startQuizBtn = document.getElementById('start-quiz-btn');
  const quizIntroStep = document.getElementById('quiz-intro-step');
  const quizQuestionStep = document.getElementById('quiz-question-step');
  const quizResultsStep = document.getElementById('quiz-results-step');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizQuestionNumber = document.getElementById('quiz-question-number');
  const quizQuestionTitle = document.getElementById('quiz-question-title');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizRecSwatch = document.getElementById('quiz-rec-swatch');
  const quizRecTitle = document.getElementById('quiz-rec-title');
  const quizRecDescription = document.getElementById('quiz-rec-description');
  const quizRecScentBreakdown = document.getElementById('quiz-rec-scent-breakdown');
  const applyQuizBtn = document.getElementById('apply-quiz-btn');
  const retakeQuizBtn = document.getElementById('retake-quiz-btn');

  // --- INITIALIZATION ---
  initApp();

  function initApp() {
    updateVisualWaxLayers();
    setupEventListeners();
    updateRoomSimulator();

    // Set initial product type visual representation
    jarElement.setAttribute('data-product-type', state.customizer.productType);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- LISTENERS ---
  function setupEventListeners() {
    // Interactive Wick Flame Toggle
    flameSystem.addEventListener('click', toggleFlame);

    // Navigation Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const step = btn.getAttribute('data-step');
        setActiveTab(step);
      });
    });

    // Product Type Selection Cards
    document.querySelectorAll('input[name="product-type-selection"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const type = e.target.value;
        state.customizer.productType = type;

        // Update price and visuals based on type
        if (type === 'glass-jar') {
          state.customizer.price = 799;
          jarElement.setAttribute('data-product-type', 'glass-jar');

          // Show swatches, hide notices
          vesselSwatchesWrapper.classList.remove('disabled');
          refillVesselNotice.classList.add('hidden');
          tinVesselNotice.classList.add('hidden');
          currentJarName.textContent = VESSELS[state.customizer.vessel];
        } else if (type === 'refill') {
          state.customizer.price = 399;
          jarElement.setAttribute('data-product-type', 'refill');

          // Hide swatches, show refill notice
          vesselSwatchesWrapper.classList.add('disabled');
          refillVesselNotice.classList.remove('hidden');
          tinVesselNotice.classList.add('hidden');
          currentJarName.textContent = 'Freestanding Wax Refill';
        } else if (type === 'travel-tin') {
          state.customizer.price = 299;
          jarElement.setAttribute('data-product-type', 'travel-tin');

          // Hide swatches, show tin notice
          vesselSwatchesWrapper.classList.add('disabled');
          refillVesselNotice.classList.add('hidden');
          tinVesselNotice.classList.remove('hidden');
          currentJarName.textContent = 'Brushed Tin';
        }

        // Update active class on parent labels
        document.querySelectorAll('.product-type-card').forEach(card => {
          card.classList.remove('active');
        });
        e.target.closest('.product-type-card').classList.add('active');

        // Update price display in UI
        const headerCandlePrice = document.getElementById('header-candle-price');
        const customCandlePrice = document.getElementById('custom-candle-price');
        if (headerCandlePrice) headerCandlePrice.textContent = state.customizer.price;
        if (customCandlePrice) customCandlePrice.textContent = `₹${state.customizer.price}`;
      });
    });

    // Vessel Radio Group
    document.querySelectorAll('input[name="jar-selection"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.customizer.vessel = e.target.value;
        currentJarName.textContent = VESSELS[state.customizer.vessel];
        jarElement.setAttribute('data-jar', state.customizer.vessel);

        // Update active class on parent swatches
        document.querySelectorAll('.vessel-swatch-card').forEach(card => {
          card.classList.remove('active');
        });
        e.target.closest('.vessel-swatch-card').classList.add('active');
      });
    });

    // Scent Dropdown selections
    scentSelectHeart.addEventListener('change', (e) => {
      state.customizer.scents.heart = e.target.value;
      updateVisualWaxLayers();
      autoUpdateSubtitle();
    });

    scentSelectDepth.addEventListener('change', (e) => {
      state.customizer.scents.depth = e.target.value;
      updateVisualWaxLayers();
      autoUpdateSubtitle();
    });

    scentSelectTwist.addEventListener('change', (e) => {
      state.customizer.scents.twist = e.target.value;
      updateVisualWaxLayers();
      autoUpdateSubtitle();
    });

    // Custom Label Form Fields
    labelInputTitle.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.customizer.label.title = val ? val : "SUNDAY COFFEE";
      previewLabelTitle.textContent = state.customizer.label.title;
    });

    labelInputScents.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.customizer.label.scents = val ? val : "Lavender, Sandalwood & Coffee";
      previewLabelScents.textContent = state.customizer.label.scents;
    });

    // Typography selector
    fontBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.customizer.label.font = btn.getAttribute('data-font');
        jarLabelElement.setAttribute('data-font', state.customizer.label.font);
      });
    });

    // Label Theme selector
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.customizer.label.theme = btn.getAttribute('data-theme');
        jarLabelElement.setAttribute('data-theme', state.customizer.label.theme);
      });
    });

    // Premium Gifting Interactive Builder Event Listeners
    const giftToggle = document.getElementById('gift-add-on-toggle');
    const giftingOptions = document.getElementById('gifting-options-group');
    const wrapBtns = document.querySelectorAll('.wrap-btn');
    const giftCardInput = document.getElementById('gift-card-message');
    const giftCharCount = document.getElementById('card-msg-char-count');

    if (giftToggle) {
      giftToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        state.customizer.gifting.enabled = isEnabled;
        if (isEnabled) {
          giftingOptions.classList.remove('hidden');
        } else {
          giftingOptions.classList.add('hidden');
        }
      });
    }

    wrapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        wrapBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.customizer.gifting.wrap = btn.getAttribute('data-wrap');
      });
    });

    if (giftCardInput) {
      giftCardInput.addEventListener('input', (e) => {
        const val = e.target.value;
        state.customizer.gifting.message = val;
        if (giftCharCount) {
          giftCharCount.textContent = `${val.length} / 120 characters`;
        }
      });
    }

    // NEW: Unboxing experience button binds
    const previewUnboxingBtn = document.getElementById('preview-unboxing-btn');
    const unboxingOverlay = document.getElementById('unboxing-modal-overlay');
    const closeUnboxingBtn = document.getElementById('close-unboxing-btn');
    const startUnboxingBtn = document.getElementById('start-unboxing-btn');
    const unboxingIntro = document.getElementById('unboxing-intro');
    const unboxingStage = document.getElementById('unboxing-stage');

    const virtualGiftBox = document.getElementById('virtual-gift-box');
    const unboxingCandleRender = document.getElementById('unboxing-candle-render');
    const unboxingCandleLabel = document.getElementById('unboxing-candle-label');
    const unboxingLabelTitle = document.getElementById('unboxing-label-title');
    const unboxingLabelScents = document.getElementById('unboxing-label-scents');
    const unboxingShowcaseTitle = document.getElementById('unboxing-showcase-title');
    const unboxingShowcaseScents = document.getElementById('unboxing-showcase-scents');
    const unboxingRevealDetails = document.getElementById('unboxing-reveal-details');
    const tissueLeft = document.getElementById('tissue-left');
    const tissueRight = document.getElementById('tissue-right');
    const boxLidElement = document.getElementById('box-lid-element');
    const giftCardPreview = document.getElementById('unboxing-gift-card-preview');

    if (previewUnboxingBtn) {
      previewUnboxingBtn.addEventListener('click', () => {
        virtualGiftBox.classList.remove('open-lid', 'open-tissue', 'reveal-candle', 'untie-ribbon');
        unboxingStage.classList.add('hidden');
        unboxingStage.style.opacity = '0';
        unboxingIntro.classList.remove('hidden');
        unboxingIntro.style.opacity = '1';

        if (giftCardPreview) {
          giftCardPreview.classList.add('hidden');
          giftCardPreview.classList.remove('show-card', 'dismiss-card');
        }

        if (tissueLeft) tissueLeft.style.transform = '';
        if (tissueRight) tissueRight.style.transform = '';
        if (boxLidElement) {
          boxLidElement.style.transform = '';
          boxLidElement.style.opacity = '1';
        }
        if (unboxingCandleRender) {
          unboxingCandleRender.style.transform = '';
          unboxingCandleRender.style.opacity = '0';
        }
        if (unboxingRevealDetails) {
          unboxingRevealDetails.style.opacity = '0';
          unboxingRevealDetails.style.transform = 'translateY(15px)';
        }

        // Apply chosen gift wrap and ribbon state dynamically
        const giftState = state.customizer.gifting || { enabled: false, wrap: 'forest-silk', message: '' };
        const ribbonV = document.getElementById('box-ribbon-v');
        const ribbonH = document.getElementById('box-ribbon-h');
        const ribbonBow = document.getElementById('box-ribbon-bow');
        const cardText = document.getElementById('unboxing-card-text');

        if (giftState.enabled) {
          virtualGiftBox.setAttribute('data-wrap', giftState.wrap);
          if (ribbonV) {
            ribbonV.style.opacity = '1';
            ribbonV.style.transform = 'scaleY(1)';
          }
          if (ribbonH) {
            ribbonH.style.opacity = '1';
            ribbonH.style.transform = 'scaleX(1)';
          }
          if (ribbonBow) {
            ribbonBow.style.opacity = '1';
            ribbonBow.style.transform = 'scale(1)';
          }
          if (cardText) {
            cardText.textContent = giftState.message ? `"${giftState.message}"` : '"Wishing you warmth and lovely light!"';
          }
        } else {
          virtualGiftBox.removeAttribute('data-wrap');
          if (ribbonV) {
            ribbonV.style.opacity = '0';
            ribbonV.style.transform = 'scaleY(0)';
          }
          if (ribbonH) {
            ribbonH.style.opacity = '0';
            ribbonH.style.transform = 'scaleX(0)';
          }
          if (ribbonBow) {
            ribbonBow.style.opacity = '0';
            ribbonBow.style.transform = 'scale(0)';
          }
        }

        unboxingCandleRender.setAttribute('data-jar', state.customizer.productType === 'glass-jar' ? state.customizer.vessel : 'gold');
        unboxingCandleLabel.setAttribute('data-theme', state.customizer.label.theme);
        unboxingLabelTitle.style.fontFamily = state.customizer.label.font === 'serif' ? "'Cormorant Garamond', serif" : "'Jost', sans-serif";

        unboxingLabelTitle.textContent = state.customizer.label.title;
        unboxingLabelScents.textContent = state.customizer.label.scents;
        unboxingShowcaseTitle.textContent = state.customizer.label.title;
        unboxingShowcaseScents.textContent = state.customizer.label.scents;

        unboxingOverlay.classList.remove('hidden');
      });
    }

    if (closeUnboxingBtn) {
      closeUnboxingBtn.addEventListener('click', () => {
        unboxingOverlay.classList.add('hidden');
      });
    }

    if (startUnboxingBtn) {
      startUnboxingBtn.addEventListener('click', () => {
        unboxingIntro.classList.add('hidden');
        unboxingStage.classList.remove('hidden');
        setTimeout(() => {
          unboxingStage.style.opacity = '1';
        }, 50);

        const giftState = state.customizer.gifting || { enabled: false };

        if (giftState.enabled) {
          // Untie Ribbon
          setTimeout(() => {
            virtualGiftBox.classList.add('untie-ribbon');
            // Remove Lid
            setTimeout(() => {
              virtualGiftBox.classList.add('open-lid');
              // Peek Card
              setTimeout(() => {
                if (giftCardPreview) {
                  giftCardPreview.classList.remove('hidden');
                  // Trigger reflow
                  giftCardPreview.offsetHeight;
                  giftCardPreview.classList.add('show-card');
                }
              }, 1200);
            }, 800);
          }, 1000);
        } else {
          // Standard transition
          setTimeout(() => {
            virtualGiftBox.classList.add('open-lid');
            setTimeout(() => {
              virtualGiftBox.classList.add('open-tissue');
              setTimeout(() => {
                virtualGiftBox.classList.add('reveal-candle');
                unboxingRevealDetails.style.opacity = '1';
                unboxingRevealDetails.style.transform = 'translateY(0)';
              }, 800);
            }, 800);
          }, 1000);
        }
      });
    }

    // Gift Card Preview Click to dismiss and open candle
    if (giftCardPreview) {
      giftCardPreview.addEventListener('click', () => {
        giftCardPreview.classList.remove('show-card');
        giftCardPreview.classList.add('dismiss-card');

        // Continue remaining animation
        setTimeout(() => {
          virtualGiftBox.classList.add('open-tissue');
          setTimeout(() => {
            virtualGiftBox.classList.add('reveal-candle');
            unboxingRevealDetails.style.opacity = '1';
            unboxingRevealDetails.style.transform = 'translateY(0)';
          }, 800);
        }, 600);
      });
    }

    // Cart actions
    addCustomCandleBtn.addEventListener('click', addCustomCandleToCart);

    document.querySelectorAll('.add-sig-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseFloat(card.getAttribute('data-price'));
        const scent = card.getAttribute('data-scent');
        const colors = card.getAttribute('data-colors');

        addSignatureCandleToCart(id, name, price, scent, colors);
      });
    });

    cartBtn.addEventListener('click', toggleCartDrawer);
    closeCartBtn.addEventListener('click', toggleCartDrawer);
    cartDrawerOverlay.addEventListener('click', toggleCartDrawer);
    applyPromoBtn.addEventListener('click', applyPromoCode);
    checkoutBtn.addEventListener('click', performCheckout);
    closeSuccessBtn.addEventListener('click', () => {
      successModalOverlay.classList.add('hidden');
    });

    if (closeCheckoutModalBtn) {
      closeCheckoutModalBtn.addEventListener('click', () => {
        if (checkoutModalOverlay) checkoutModalOverlay.classList.add('hidden');
      });
    }

    if (checkoutDetailsForm) {
      checkoutDetailsForm.addEventListener('submit', handlePaymentAndOrderSubmit);
    }


    // Scent Finder Quiz Logic
    let currentQuizIndex = 0;
    let scoreTracker = { lavender: 0, vanilla: 0, sandalwood: 0, coffee: 0, 'first-rain': 0, rose: 0, lemongrass: 0, orange: 0, coconut: 0, chocolate: 0, cinnamon: 0, pineapple: 0, clove: 0, 'ylang-ylang': 0 };
    startQuizBtn.addEventListener('click', () => {
      currentQuizIndex = 0;
      // reset scores
      Object.keys(scoreTracker).forEach(k => scoreTracker[k] = 0);
      quizIntroStep.classList.add('hidden');
      quizQuestionStep.classList.remove('hidden');
      renderQuizQuestion();
    });

    retakeQuizBtn.addEventListener('click', () => {
      currentQuizIndex = 0;
      Object.keys(scoreTracker).forEach(k => scoreTracker[k] = 0);
      quizResultsStep.classList.add('hidden');
      quizQuestionStep.classList.remove('hidden');
      renderQuizQuestion();
    });

    function renderQuizQuestion() {
      const q = QUIZ_QUESTIONS[currentQuizIndex];
      const progress = ((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100;

      quizProgressFill.style.width = `${progress}%`;
      quizQuestionNumber.textContent = `Question ${currentQuizIndex + 1} of ${QUIZ_QUESTIONS.length}`;
      quizQuestionTitle.textContent = q.title;

      quizOptionsContainer.innerHTML = '';
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `
          <span>${opt.text}</span>
          <span class="quiz-option-desc">${opt.desc}</span>
        `;

        btn.addEventListener('click', () => {
          // Accumulate weights
          Object.keys(opt.weights).forEach(k => {
            scoreTracker[k] += opt.weights[k];
          });

          currentQuizIndex++;
          if (currentQuizIndex < QUIZ_QUESTIONS.length) {
            renderQuizQuestion();
          } else {
            calculateQuizResults();
          }
        });

        quizOptionsContainer.appendChild(btn);
      });
    }

    function calculateQuizResults() {
      quizQuestionStep.classList.add('hidden');
      quizResultsStep.classList.remove('hidden');

      // Aggregate high scores to select recommendation
      let maxScore = 0;
      let selectedProfile = QUIZ_RECOMMENDATIONS[0];

      QUIZ_RECOMMENDATIONS.forEach(rec => {
        const score = scoreTracker[rec.heart] * 2 + scoreTracker[rec.depth] + scoreTracker[rec.twist] * 0.5;
        if (score > maxScore) {
          maxScore = score;
          selectedProfile = rec;
        }
      });

      // Update UI elements
      quizRecTitle.textContent = selectedProfile.title;
      quizRecDescription.textContent = selectedProfile.description;

      const heartColor = SCENT_POOL[selectedProfile.heart].color;
      const depthColor = SCENT_POOL[selectedProfile.depth].color;
      const twistColor = SCENT_POOL[selectedProfile.twist].color;

      quizRecSwatch.style.background = `linear-gradient(135deg, ${twistColor} 0%, ${heartColor} 50%, ${depthColor} 100%)`;

      quizRecScentBreakdown.innerHTML = `
        <div class="scent-share-row">
          <span style="font-size:0.85rem; width:140px">60% Heart: ${SCENT_POOL[selectedProfile.heart].name}</span>
          <div class="scent-share-bar-bg"><div class="scent-share-bar-fill" style="width: 60%; background:${heartColor}"></div></div>
        </div>
        <div class="scent-share-row">
          <span style="font-size:0.85rem; width:140px">30% Depth: ${SCENT_POOL[selectedProfile.depth].name}</span>
          <div class="scent-share-bar-bg"><div class="scent-share-bar-fill" style="width: 30%; background:${depthColor}"></div></div>
        </div>
        <div class="scent-share-row">
          <span style="font-size:0.85rem; width:140px">10% Twist: ${SCENT_POOL[selectedProfile.twist].name}</span>
          <div class="scent-share-bar-bg"><div class="scent-share-bar-fill" style="width: 10%; background:${twistColor}"></div></div>
        </div>
      `;

      // Apply quiz action
      applyQuizBtn.onclick = () => {
        state.customizer.scents.heart = selectedProfile.heart;
        state.customizer.scents.depth = selectedProfile.depth;
        state.customizer.scents.twist = selectedProfile.twist;

        // Sync dropdown values
        scentSelectHeart.value = selectedProfile.heart;
        scentSelectDepth.value = selectedProfile.depth;
        scentSelectTwist.value = selectedProfile.twist;

        // Sync labels
        state.customizer.label.title = selectedProfile.title.toUpperCase();
        state.customizer.label.scents = `${SCENT_POOL[selectedProfile.heart].name}, ${SCENT_POOL[selectedProfile.depth].name} & ${SCENT_POOL[selectedProfile.twist].name}`;

        labelInputTitle.value = state.customizer.label.title;
        labelInputScents.value = state.customizer.label.scents;
        previewLabelTitle.textContent = state.customizer.label.title;
        previewLabelScents.textContent = state.customizer.label.scents;

        updateVisualWaxLayers();
        setActiveTab("2"); // switch to Scent layers step tab

        // Smooth scroll to builder
        document.getElementById('customizer').scrollIntoView({ behavior: 'smooth' });
        showToast("Recipe loaded! Customize vessel or title below.");
      };
    }

    // Shop Category Filter System
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('#product-grid-catalog .product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.getAttribute('data-filter');

        productCards.forEach(card => {
          // Fade out first for smooth effect
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';

          setTimeout(() => {
            const matchesCollection = card.getAttribute('data-collection') === filterVal;
            const matchesMood = card.getAttribute('data-mood') === filterVal;
            const matchesRoom = card.getAttribute('data-room') === filterVal;

            if (filterVal === 'all' || matchesCollection || matchesMood || matchesRoom) {
              card.classList.remove('hidden');
              // trigger reflow to restart animation
              card.offsetHeight;
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            } else {
              card.classList.add('hidden');
            }
          }, 250);
        });
      });
    });

    // FAQs Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const answer = item.querySelector('.faq-answer');

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other accordion items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-answer').style.maxHeight = '0';
        });

        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    // Corporate Gifting Bulk enquiry Form
    const bulkEnquiryForm = document.getElementById('bulk-enquiry-form');
    if (bulkEnquiryForm) {
      bulkEnquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("🚀 Corporate Gifting Form submit event fired!");

        const name = document.getElementById('corp-name').value;
        const email = document.getElementById('corp-email').value;
        const org = document.getElementById('corp-org').value;
        const qty = document.getElementById('corp-qty').value;
        const details = document.getElementById('corp-msg').value;

        // Save locally
        saveInquiryToLocalStorage({
          type: 'gifting',
          name: name,
          email: email,
          org: org,
          qty: qty,
          details: details,
          timestamp: Date.now()
        });

        const submitBtn = bulkEnquiryForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending Inquiry...";

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          bulkEnquiryForm.reset();

          triggerCandleGlowAnimation(() => {
            const randomOrder = `ENQ-${Math.floor(10000 + Math.random() * 90000)}`;
            if (orderNumberText) orderNumberText.textContent = randomOrder;
            if (successTitle) successTitle.textContent = "You glowed the candle! Order booked successfully!";
            if (successDesc) successDesc.textContent = `Thank you, ${name}! Your corporate gifting inquiry has been received. Our team will contact you within 24 hours to discuss customization details.`;
            if (orderIdLabel) orderIdLabel.textContent = "Inquiry ID";
            if (successModalOverlay) successModalOverlay.classList.remove('hidden');
          });

          showToast(`Thank you, ${name}! Your inquiry has been sent. We'll reply within 24 hours.`);
        }, 1500);
      });
    }

    // --- SOUND & SIMULATOR EVENT LISTENERS ---
    const audioToggleBtn = document.getElementById('ambient-audio-toggle');
    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', () => {
        audioState.isMuted = !audioState.isMuted;
        audioToggleBtn.classList.toggle('active', !audioState.isMuted);

        const icon = audioToggleBtn.querySelector('i');
        if (icon) {
          if (audioState.isMuted) {
            icon.setAttribute('data-lucide', 'volume-x');
          } else {
            icon.setAttribute('data-lucide', 'volume-2');
          }
          if (window.lucide) {
            window.lucide.createIcons();
          }
        }
        updateAudioState();
      });
    }

    // Soundscape chips selection
    document.querySelectorAll('input[name="soundscape-selection"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        audioState.activeSoundscape = e.target.value;

        // Update chips active class
        document.querySelectorAll('.soundscape-chip').forEach(chip => {
          chip.classList.remove('active');
        });
        e.target.closest('.soundscape-chip').classList.add('active');

        updateAudioState();
      });
    });

    // Room Size Selection
    const roomSizeSelect = document.getElementById('room-size-select');
    if (roomSizeSelect) {
      roomSizeSelect.addEventListener('change', () => {
        updateRoomSimulator();
      });
    }

    // Burn Time Slider Selection
    const burnTimeSlider = document.getElementById('burn-time-slider');
    if (burnTimeSlider) {
      burnTimeSlider.addEventListener('input', () => {
        updateRoomSimulator();
      });
    }
  }


  // --- OLFACTORY CHEMISTRY SYNERGY ENGINE ---
  function updateScentSynergy() {
    const heartKey = state.customizer.scents.heart;
    const depthKey = state.customizer.scents.depth;
    const twistKey = state.customizer.scents.twist;

    const heart = SCENT_POOL[heartKey];
    const depth = SCENT_POOL[depthKey];
    const twist = SCENT_POOL[twistKey];

    const categories = {
      lavender: 'floral',
      vanilla: 'sweet',
      rose: 'floral',
      sandalwood: 'woody',
      'first-rain': 'earthy',
      coffee: 'roasted',
      orange: 'citrus',
      coconut: 'sweet',
      chocolate: 'sweet',
      lemongrass: 'citrus',
      cinnamon: 'spicy',
      pineapple: 'fruity',
      clove: 'spicy',
      'ylang-ylang': 'floral'
    };

    const heartCat = categories[heartKey] || 'botanical';
    const depthCat = categories[depthKey] || 'botanical';
    const twistCat = categories[twistKey] || 'botanical';

    const uniqueCats = new Set([heartCat, depthCat, twistCat]);

    let score = 94;
    let vibe = "Complex Curated Blend";

    if (heartKey === depthKey && depthKey === twistKey) {
      score = 98;
      vibe = `Mono-Accord Pure ${heart.name}`;
    } else {
      if (uniqueCats.size === 1) {
        score = 95;
        vibe = `Harmonious ${heartCat.charAt(0).toUpperCase() + heartCat.slice(1)} Fusion`;
      } else if (uniqueCats.size === 2) {
        score = 92;
        if (uniqueCats.has('floral') && uniqueCats.has('sweet')) vibe = "Velvet Floral Nectar";
        else if (uniqueCats.has('woody') && uniqueCats.has('spicy')) vibe = "Cozy Autumn Hearth";
        else if (uniqueCats.has('citrus') && uniqueCats.has('floral')) vibe = "Bright Orchard Breeze";
        else if (uniqueCats.has('roasted') && uniqueCats.has('sweet')) vibe = "Gourmand Cafe Classic";
        else if (uniqueCats.has('earthy') && uniqueCats.has('woody')) vibe = "Rainwashed Forest Accord";
        else vibe = "Balanced Olfactory Duo";
      } else {
        score = 88;
        if (uniqueCats.has('citrus') && uniqueCats.has('spicy') && uniqueCats.has('sweet')) {
          score = 94;
          vibe = "Festive Spiced Citrus";
        } else if (uniqueCats.has('floral') && uniqueCats.has('woody') && uniqueCats.has('earthy')) {
          score = 93;
          vibe = "Botanical Zen Sanctuary";
        } else {
          vibe = "Eclectic Multi-Layered Fusion";
        }
      }
    }

    const synergyScoreVal = document.getElementById('synergy-score-val');
    const synergyVibeVal = document.getElementById('synergy-vibe-val');
    const synergyTwistDesc = document.getElementById('synergy-twist-desc');
    const synergyHeartDesc = document.getElementById('synergy-heart-desc');
    const synergyDepthDesc = document.getElementById('synergy-depth-desc');

    if (synergyScoreVal) synergyScoreVal.textContent = `${score}%`;
    if (synergyVibeVal) synergyVibeVal.textContent = vibe;

    if (synergyTwistDesc) {
      synergyTwistDesc.textContent = `A brief, zesty opening note of ${twist.name} cuts through the air first.`;
    }
    if (synergyHeartDesc) {
      synergyHeartDesc.textContent = `The core body notes of ${heart.name} bloom and dominate the room.`;
    }
    if (synergyDepthDesc) {
      synergyDepthDesc.textContent = `A warm foundation of ${depth.name} anchors the scent and lingers for hours.`;
    }
  }

  // --- PROCEDURAL ASMR AUDIO ENGINE ---
  function initAudioContext() {
    if (audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      // Master Gain Node
      mainGainNode = audioCtx.createGain();
      mainGainNode.gain.setValueAtTime(0, audioCtx.currentTime); // start silent
      mainGainNode.connect(audioCtx.destination);

      // Create continuous noise buffer for rain/rumble/crackles
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // 1. Generate gentle candle wax rumble
      rumbleSource = audioCtx.createBufferSource();
      rumbleSource.buffer = noiseBuffer;
      rumbleSource.loop = true;

      const rumbleFilter = audioCtx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 120;

      rumbleGainNode = audioCtx.createGain();
      rumbleGainNode.gain.value = 0.4;

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGainNode);
      rumbleGainNode.connect(mainGainNode);
      rumbleSource.start();

      // 2. Generate Rain Synthesizer (continuous lowpass noise + volume drift LFO)
      rainSource = audioCtx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const rainFilter = audioCtx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 500;
      rainFilter.Q.value = 0.8;

      rainGainNode = audioCtx.createGain();
      rainGainNode.gain.value = 0; // muted by default

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGainNode);
      rainGainNode.connect(mainGainNode);
      rainSource.start();

      // Rainy LFO drift
      const rainLfo = audioCtx.createOscillator();
      rainLfo.type = 'sine';
      rainLfo.frequency.value = 0.15; // 0.15Hz slow drift

      const rainLfoGain = audioCtx.createGain();
      rainLfoGain.gain.value = 0.05;

      rainLfo.connect(rainLfoGain);
      rainLfoGain.connect(rainGainNode.gain);
      rainLfo.start();

      // 3. Generate Zen Chord Drone (meditative pad)
      droneGainNode = audioCtx.createGain();
      droneGainNode.gain.value = 0; // muted by default

      const droneFilter = audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 250;
      droneFilter.connect(droneGainNode);
      droneGainNode.connect(mainGainNode);

      // Frequencies for a beautiful E major 9 chord: E2, B2, F#3, B3
      const freqs = [82.41, 123.47, 185.00, 246.94];
      freqs.forEach(f => {
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = f;

        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 0.15;

        // Modulate osc gain slightly to create movement
        const oscLfo = audioCtx.createOscillator();
        oscLfo.type = 'sine';
        oscLfo.frequency.value = 0.1 + Math.random() * 0.1; // very slow

        const oscLfoGain = audioCtx.createGain();
        oscLfoGain.gain.value = 0.05;

        oscLfo.connect(oscLfoGain);
        oscLfoGain.connect(oscGain.gain);

        osc.connect(oscGain);
        oscGain.connect(droneFilter);

        osc.start();
        oscLfo.start();
        droneOscillators.push(osc);
      });

      // 4. Start Crackle Scheduler
      startCrackleScheduler(noiseBuffer);

    } catch (e) {
      console.warn("Web Audio API not supported or blocked: ", e);
    }
  }

  function startCrackleScheduler(noiseBuffer) {
    const scheduleCrackle = () => {
      const delay = 40 + Math.random() * 180;
      crackleTimer = setTimeout(() => {
        if (audioCtx && audioCtx.state === 'running' && !audioState.isMuted && state.customizer.isLit) {
          try {
            const popSrc = audioCtx.createBufferSource();
            popSrc.buffer = noiseBuffer;

            const popFilter = audioCtx.createBiquadFilter();
            popFilter.type = 'bandpass';
            popFilter.frequency.value = 800 + Math.random() * 1500;
            popFilter.Q.value = 6;

            const popGain = audioCtx.createGain();
            popGain.gain.setValueAtTime(0, audioCtx.currentTime);
            popGain.gain.linearRampToValueAtTime(0.04 * (0.2 + Math.random() * 0.8), audioCtx.currentTime + 0.001);
            popGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.005 + Math.random() * 0.015);

            popSrc.connect(popFilter);
            popFilter.connect(popGain);
            popGain.connect(mainGainNode);
            popSrc.start();
          } catch (err) { }
        }
        scheduleCrackle();
      }, delay);
    };
    scheduleCrackle();
  }

  function updateAudioState() {
    if (!audioCtx) initAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const shouldPlay = state.customizer.isLit && !audioState.isMuted;

    const targetGain = shouldPlay ? 1.0 : 0.0;
    mainGainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.15);

    if (shouldPlay) {
      if (audioState.activeSoundscape === 'crackle') {
        rainGainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.3);
        droneGainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.3);
      } else if (audioState.activeSoundscape === 'rain') {
        rainGainNode.gain.setTargetAtTime(0.35, audioCtx.currentTime, 0.5);
        droneGainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.3);
      } else if (audioState.activeSoundscape === 'zen') {
        rainGainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.3);
        droneGainNode.gain.setTargetAtTime(0.4, audioCtx.currentTime, 0.6);
      }
    }
  }

  // --- SCENT THROW ROOM SIMULATOR ---
  function updateRoomSimulator() {
    const floorPlanEl = document.getElementById('room-floor-plan');
    if (!floorPlanEl) return;

    const twistScent = state.customizer.scents.twist;
    const heartScent = state.customizer.scents.heart;
    const depthScent = state.customizer.scents.depth;

    const twistColor = SCENT_POOL[twistScent].color;
    const heartColor = SCENT_POOL[heartScent].color;
    const depthColor = SCENT_POOL[depthScent].color;

    // Apply colors to simulator CSS variables
    floorPlanEl.style.setProperty('--sim-twist-color', twistColor);
    floorPlanEl.style.setProperty('--sim-heart-color', heartColor);
    floorPlanEl.style.setProperty('--sim-depth-color', depthColor);

    // Read room size & burn time
    const roomSizeSelect = document.getElementById('room-size-select');
    const burnTimeSlider = document.getElementById('burn-time-slider');
    const burnTimeValEl = document.getElementById('burn-time-val');

    const roomSize = roomSizeSelect ? roomSizeSelect.value : 'medium';
    const burnTime = burnTimeSlider ? burnTimeSlider.value : '2';

    // Map burn time value to label
    const timeLabels = { '1': '15 Mins', '2': '1 Hour', '3': '3 Hours' };
    if (burnTimeValEl) {
      burnTimeValEl.textContent = timeLabels[burnTime] || '1 Hour';
    }

    // Set scale maximums for scent rings
    const scales = {
      small: { '1': 2.2, '2': 4.0, '3': 5.5 },
      medium: { '1': 1.5, '2': 3.0, '3': 4.5 },
      large: { '1': 1.0, '2': 2.0, '3': 3.2 }
    };
    const scaleMax = scales[roomSize][burnTime];
    floorPlanEl.style.setProperty('--sim-scale-max', scaleMax);

    // Toggle Lit animation trigger
    if (state.customizer.isLit) {
      floorPlanEl.classList.add('lit');
    } else {
      floorPlanEl.classList.remove('lit');
    }

    // Update textual description
    const twistName = SCENT_POOL[twistScent].name;
    const heartName = SCENT_POOL[heartScent].name;
    const depthName = SCENT_POOL[depthScent].name;

    let text = "";
    if (burnTime === '1') { // 15 Mins
      if (roomSize === 'small') {
        text = `At 15 minutes, a strong top-note aura of <strong>${twistName}</strong> (Twist) has already spread across the 80 sq ft powder room.`;
      } else if (roomSize === 'medium') {
        text = `At 15 minutes, the zesty top notes of <strong>${twistName}</strong> have begun to float, gently layering the space around the candle table.`;
      } else {
        text = `At 15 minutes, the unexpected accent of <strong>${twistName}</strong> is lifting off, slowly making its presence known in the grand 350 sq ft living room.`;
      }
    } else if (burnTime === '2') { // 1 Hour
      if (roomSize === 'small') {
        text = `At 1 hour, the dominant heart notes of <strong>${heartName}</strong> have completely bloomed, filling every corner of your 80 sq ft space with comforting notes.`;
      } else if (roomSize === 'medium') {
        text = `At 1 hour, the core body of <strong>${heartName}</strong> is fully diffused, creating a relaxing, beautifully balanced 150 sq ft sanctuary.`;
      } else {
        text = `At 1 hour, <strong>${heartName}</strong> notes are spreading through the air, mixing with <strong>${twistName}</strong> to form a cozy scent zone around the sofa.`;
      }
    } else { // 3 Hours
      if (roomSize === 'small') {
        text = `At 3 hours, the candle has reached its deep base. Grounding notes of <strong>${depthName}</strong> have thoroughly infused the space, lingering long after the flame.`;
      } else if (roomSize === 'medium') {
        text = `At 3 hours, a rich base of <strong>${depthName}</strong> has settled in. Combined with the heart, it anchors the atmosphere of your standard bedroom.`;
      } else {
        text = `At 3 hours, all three layers (<strong>${twistName}</strong>, <strong>${heartName}</strong>, and <strong>${depthName}</strong>) have merged into a rich, full-bodied olfactory symphony, filling the entire 350 sq ft space.`;
      }
    }

    const descEl = document.getElementById('room-diffusion-description');
    if (descEl) descEl.innerHTML = text;
  }

  // --- WAX LAYERS RENDER ENGINE ---
  function updateVisualWaxLayers() {
    const heartScent = state.customizer.scents.heart;
    const depthScent = state.customizer.scents.depth;
    const twistScent = state.customizer.scents.twist;

    const heartColor = SCENT_POOL[heartScent].color;
    const depthColor = SCENT_POOL[depthScent].color;
    const twistColor = SCENT_POOL[twistScent].color;

    // Apply color values to preview jar layers
    waxTwistVisual.style.background = twistColor;
    waxHeartVisual.style.background = heartColor;
    waxDepthVisual.style.background = depthColor;

    // Apply color values to configurator swatch helper
    swatchBandTwist.style.background = twistColor;
    swatchBandHeart.style.background = heartColor;
    swatchBandDepth.style.background = depthColor;

    // Update Olfactory Synergy
    updateScentSynergy();

    // Update Room Scent Throw Simulator
    updateRoomSimulator();
  }

  function autoUpdateSubtitle() {
    const heartName = SCENT_POOL[state.customizer.scents.heart].name;
    const depthName = SCENT_POOL[state.customizer.scents.depth].name;
    const twistName = SCENT_POOL[state.customizer.scents.twist].name;

    const autoSubtitle = `${heartName}, ${depthName} & ${twistName}`;
    state.customizer.label.scents = autoSubtitle;
    labelInputScents.value = autoSubtitle;
    previewLabelScents.textContent = autoSubtitle;
  }

  // --- FLAME INTERACTION LOGIC ---
  function toggleFlame() {
    state.customizer.isLit = !state.customizer.isLit;

    if (state.customizer.isLit) {
      interactiveFlame.classList.add('active');
      flameStatus.textContent = "LIT";
      flameToggleHint.textContent = "Click the flame to extinguish it";

      const stage = document.querySelector('.visualizer-stage');
      stage.style.boxShadow = 'inset 0 0 100px rgba(212,175,55,0.06)';

      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }

      startWaveVisualizer();
    } else {
      interactiveFlame.classList.remove('active');
      flameStatus.textContent = "UNLIT";
      flameToggleHint.textContent = "Click the wick to light the candle";

      const stage = document.querySelector('.visualizer-stage');
      stage.style.boxShadow = 'none';
    }

    // Sync ASMR Audio and Room Simulator
    updateAudioState();
    updateRoomSimulator();
  }

  function triggerCandleGlowAnimation(callback) {
    const customizerEl = document.getElementById('customizer');
    if (customizerEl) {
      customizerEl.scrollIntoView({ behavior: 'smooth' });
    }

    if (!state.customizer.isLit) {
      toggleFlame();
    }

    const stage = document.querySelector('.visualizer-stage');
    if (stage) {
      stage.classList.add('order-glow');
    }

    setTimeout(() => {
      if (stage) {
        stage.classList.remove('order-glow');
      }
      callback();
    }, 2500);
  }

  // --- NAVIGATION TABS ENGINE ---
  function setActiveTab(stepNum) {
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-step') === stepNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    stepContents.forEach(content => {
      if (content.id === `step-${stepNum}`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  // --- TOAST ALERTS ---
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastNotification.classList.add('active');
    setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 3000);
  }

  // --- CART ENGINE ---
  function toggleCartDrawer() {
    cartDrawer.classList.toggle('open');
    cartDrawerOverlay.classList.toggle('open');
  }

  function addSignatureCandleToCart(id, name, price, scent, colors) {
    const existing = state.cart.find(item => item.id === id);

    if (existing) {
      existing.quantity++;
    } else {
      state.cart.push({
        id: id,
        name: name,
        price: price,
        description: scent,
        colors: colors,
        isCustom: false,
        quantity: 1
      });
    }

    renderCart();
    showToast(`"${name}" added to bag!`);
    setTimeout(toggleCartDrawer, 400);
  }

  function addCustomCandleToCart() {
    const c = state.customizer;

    // Generate unique ID based on settings
    const customId = `custom-${c.productType}-${c.productType === 'glass-jar' ? c.vessel : ''}-${c.scents.heart}-${c.scents.depth}-${c.scents.twist}-${c.label.title.toLowerCase().replace(/\s+/g, '-')}`;

    const heartName = SCENT_POOL[c.scents.heart].name;
    const depthName = SCENT_POOL[c.scents.depth].name;
    const twistName = SCENT_POOL[c.scents.twist].name;

    let name = '';
    let description = '';

    if (c.productType === 'glass-jar') {
      name = "Bespoke Custom Candle (Glass Jar)";
      const vesselName = VESSELS[c.vessel];
      description = `Vessel: ${vesselName} | Recipe: 60% ${heartName}, 30% ${depthName}, 10% ${twistName} | Label: "${c.label.title}"`;
    } else if (c.productType === 'refill') {
      name = "Bespoke Custom Candle (Wax Refill)";
      description = `Refill (No Jar) | Recipe: 60% ${heartName}, 30% ${depthName}, 10% ${twistName} | Label: "${c.label.title}"`;
    } else if (c.productType === 'travel-tin') {
      name = "Bespoke Custom Candle (Travel Tin)";
      description = `Container: Brushed Tin | Recipe: 60% ${heartName}, 30% ${depthName}, 10% ${twistName} | Label: "${c.label.title}"`;
    }

    // Create color gradient representation for Cart thumbnail card
    const heartColor = SCENT_POOL[c.scents.heart].color;
    const depthColor = SCENT_POOL[c.scents.depth].color;
    const twistColor = SCENT_POOL[c.scents.twist].color;
    const colorMix = `${twistColor}, ${heartColor}, ${depthColor}`;

    const existing = state.cart.find(item => item.id === customId);

    if (existing) {
      existing.quantity++;
    } else {
      state.cart.push({
        id: customId,
        name: name,
        price: c.price,
        description: description,
        colors: colorMix,
        isCustom: true,
        quantity: 1
      });
    }

    renderCart();
    showToast("Your custom candle added to bag!");
    setTimeout(toggleCartDrawer, 400);
  }

  function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (state.cart.length === 0) {
      emptyCartMessage.classList.remove('hidden');
      cartFooter.classList.add('hidden');
      cartCount.textContent = '0';
      return;
    }

    emptyCartMessage.classList.add('hidden');
    cartFooter.classList.remove('hidden');

    let subtotal = 0;
    let totalItems = 0;

    state.cart.forEach(item => {
      totalItems += item.quantity;
      subtotal += item.price * item.quantity;

      const itemCard = document.createElement('div');
      itemCard.className = 'cart-item';

      let visualBackground = '';
      if (item.isCustom) {
        const colorsArr = item.colors.split(',');
        visualBackground = `linear-gradient(180deg, ${colorsArr[0].trim()} 0%, ${colorsArr[1].trim()} 60%, ${colorsArr[2].trim()} 100%)`;
      } else {
        const colorsArr = item.colors.split(',');
        visualBackground = `linear-gradient(180deg, ${colorsArr[0].trim()} 0%, ${colorsArr[1].trim()} 100%)`;
      }

      itemCard.innerHTML = `
        <div class="item-thumb-wrapper">
          <div class="item-candle-mini-preview" style="border: 1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02)">
            <div class="item-candle-wax-bar" style="background: ${visualBackground}"></div>
          </div>
        </div>

        <div class="item-details">
          <h4>${item.name}</h4>
          <p class="item-desc-text">${item.description}</p>
          
          <div class="item-quantity-row">
            <div class="quantity-controls">
              <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
            </div>
            <span class="item-price">₹${item.price * item.quantity}</span>
          </div>
        </div>

        <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove item">
          <i data-lucide="trash-2"></i>
        </button>
      `;

      cartItemsContainer.appendChild(itemCard);
    });

    cartCount.textContent = totalItems;

    // Apply promo discounts
    const discountValue = subtotal * state.discount;
    const discountedSubtotal = subtotal - discountValue;

    // Shipping calculations: FREE above ₹999, else ₹100
    const shipping = discountedSubtotal >= 999 ? 0 : 100;
    const finalTotal = discountedSubtotal + shipping;

    cartSubtotal.textContent = `₹${subtotal.toFixed(0)}`;
    cartShippingFee.textContent = shipping === 0 ? "FREE" : `₹${shipping}`;
    if (shipping === 0) {
      cartShippingFee.className = "green-text";
    } else {
      cartShippingFee.className = "";
    }
    cartTotal.textContent = `₹${finalTotal.toFixed(0)}`;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    setupCartListeners();
  }

  function setupCartListeners() {
    document.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        updateQty(e.target.getAttribute('data-id'), -1);
      });
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        updateQty(e.target.getAttribute('data-id'), 1);
      });
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        removeItem(e.currentTarget.getAttribute('data-id'));
      });
    });
  }

  function updateQty(id, change) {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(id);
    } else {
      renderCart();
    }
  }

  function removeItem(id) {
    state.cart = state.cart.filter(item => item.id !== id);
    renderCart();
    showToast("Item removed.");
  }

  // --- PROMO CODE DISCOUNTS ---
  function applyPromoCode() {
    const code = promoInput.value.trim().toUpperCase();

    if (state.promoApplied) {
      showToast("Promo already applied.");
      return;
    }

    if (code === "LIGHTUP") {
      state.discount = 0.15; // 15% discount
      state.promoApplied = true;
      showToast("Promo Code LIGHTUP applied! 15% Off.");
      renderCart();
    } else {
      showToast("Invalid promo code. Hint: LIGHTUP");
    }
  }

  // --- CHECKOUT PROCESS SIMULATION ---
  function performCheckout() {
    if (state.cart.length === 0) {
      showToast("Your shopping bag is empty.");
      return;
    }
    // Open the checkout details modal
    if (checkoutModalOverlay) {
      checkoutModalOverlay.classList.remove('hidden');
    }
  }

  async function handlePaymentAndOrderSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('bill-name').value.trim();
    const email = document.getElementById('bill-email').value.trim();
    const phone = document.getElementById('bill-phone').value.trim();
    const paymentMethod = document.getElementById('bill-payment').value;
    const address = document.getElementById('bill-address').value.trim();

    const payBtn = document.getElementById('btn-pay-complete');
    if (!payBtn) return;
    const originalText = payBtn.textContent;
    payBtn.disabled = true;
    payBtn.textContent = "Processing Payment...";

    // Calculate totals
    let subtotal = 0;
    state.cart.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    const discountValue = subtotal * state.discount;
    const discountedSubtotal = subtotal - discountValue;
    const shipping = discountedSubtotal >= 999 ? 0 : 100;
    const total = discountedSubtotal + shipping;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `AE-${randomSuffix}`;
    const transactionId = `TXN-${randomSuffix}`;

    const bookingData = {
      orderId: orderId,
      customerInfo: { name, email, phone, address },
      items: state.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        colors: item.colors,
        isCustom: item.isCustom,
        quantity: item.quantity
      })),
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      status: 'Pending'
    };

    const paymentData = {
      transactionId: transactionId,
      orderId: orderId,
      amount: total,
      paymentMethod: paymentMethod,
      status: paymentMethod === 'COD' ? 'Pending' : 'Success'
    };

    try {
      // 1. Save Booking
      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      // 2. Save Payment
      const paymentResponse = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (bookingResponse.ok && paymentResponse.ok) {
        checkoutDetailsForm.reset();
        if (checkoutModalOverlay) checkoutModalOverlay.classList.add('hidden');
        toggleCartDrawer();

        // Clear cart state
        state.cart = [];
        state.discount = 0;
        state.promoApplied = false;
        if (promoInput) promoInput.value = '';
        renderCart();

        // Trigger candle glow and reveal order details
        triggerCandleGlowAnimation(() => {
          if (orderNumberText) orderNumberText.textContent = `${orderId} (${paymentMethod === 'COD' ? 'COD Pending' : 'Paid'})`;
          if (successTitle) successTitle.textContent = "Order Placed Successfully!";
          if (successDesc) successDesc.textContent = `Thank you, ${name}! Your order items are saved to database. Transaction Reference: ${transactionId}. Our team will contact you shortly.`;
          if (orderIdLabel) orderIdLabel.textContent = "Order ID";
          if (successModalOverlay) successModalOverlay.classList.remove('hidden');
        });
        showToast("Order booked in database!");
      } else {
        showToast("Error processing checkout. Please try again.");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to connect to local server.");
    } finally {
      payBtn.disabled = false;
      payBtn.textContent = originalText;
    }
  }

  // --- BULK ORDER ENQUIRY MODAL LOGIC ---
  const bulkOrderBtn = document.getElementById('bulk-order-btn');
  const bulkOrderNavLink = document.getElementById('bulk-order-nav-link');
  const bulkOrderModalOverlay = document.getElementById('bulk-order-modal-overlay');
  const closeEnquiryBtn = document.getElementById('close-enquiry-btn');
  const bulkOrderEnquiryForm = document.getElementById('bulk-order-enquiry-form');

  function openBulkOrderModal() {
    if (bulkOrderModalOverlay) {
      bulkOrderModalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeBulkOrderModal() {
    if (bulkOrderModalOverlay) {
      bulkOrderModalOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (bulkOrderBtn) {
    bulkOrderBtn.addEventListener('click', openBulkOrderModal);
  }
  if (bulkOrderNavLink) {
    bulkOrderNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      openBulkOrderModal();
    });
  }
  if (closeEnquiryBtn) {
    closeEnquiryBtn.addEventListener('click', closeBulkOrderModal);
  }
  if (bulkOrderModalOverlay) {
    bulkOrderModalOverlay.addEventListener('click', (e) => {
      if (e.target === bulkOrderModalOverlay) {
        closeBulkOrderModal();
      }
    });
  }

  // Also close on Esc key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bulkOrderModalOverlay && !bulkOrderModalOverlay.classList.contains('hidden')) {
      closeBulkOrderModal();
    }
  });

  if (bulkOrderEnquiryForm) {
    bulkOrderEnquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("🚀 Bulk Order Modal Form submit event fired!");
      const name = document.getElementById('enq-name').value;
      const email = document.getElementById('enq-email').value;
      const phone = document.getElementById('enq-phone').value;
      const qty = document.getElementById('enq-qty').value;
      const subject = document.getElementById('enq-subject').value;
      const message = document.getElementById('enq-message').value;

      // Save locally
      saveInquiryToLocalStorage({
        type: 'bulk',
        name: name,
        email: email,
        phone: phone,
        qty: qty,
        subject: subject,
        message: message,
        timestamp: Date.now()
      });

      const submitBtn = bulkOrderEnquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending Enquiry...";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        bulkOrderEnquiryForm.reset();
        closeBulkOrderModal();

        triggerCandleGlowAnimation(() => {
          const randomOrder = `ENQ-${Math.floor(10000 + Math.random() * 90000)}`;
          if (orderNumberText) orderNumberText.textContent = randomOrder;
          if (successTitle) successTitle.textContent = "You glowed the candle! Order booked successfully!";
          if (successDesc) successDesc.textContent = `Thank you, ${name}! Your bulk order inquiry has been received. Our team will contact you shortly to review your request.`;
          if (orderIdLabel) orderIdLabel.textContent = "Inquiry ID";
          if (successModalOverlay) successModalOverlay.classList.remove('hidden');
        });

        showToast(`Thank you, ${name}! Your enquiry has been received. Our team will contact you shortly.`);
      }, 1500);
    });
  }

  async function saveInquiryToLocalStorage(data) {
    try {
      const response = await fetch('http://localhost:5000/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        console.log("📥 Inquiry logged to database:", data);
      } else {
        console.error("Failed to log inquiry");
      }
    } catch (e) {
      console.error("Failed to send inquiry to API:", e);
    }
  }

  // --- PROCEDURAL NEON SOUNDWAVE VISUALIZER ENGINE ---
  const waveCanvas = document.getElementById('asmr-waveform-canvas');
  let waveCtx = null;
  let waveAnimationId = null;

  if (waveCanvas) {
    waveCtx = waveCanvas.getContext('2d');
  }

  function startWaveVisualizer() {
    if (!waveCanvas || !waveCtx) return;
    waveCanvas.style.opacity = '1';

    // Scale canvas dynamically for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = waveCanvas.getBoundingClientRect();
    waveCanvas.width = rect.width * dpr;
    waveCanvas.height = rect.height * dpr;
    waveCtx.scale(dpr, dpr);

    let phase = 0;

    function animate() {
      if (!state.customizer.isLit) {
        cancelAnimationFrame(waveAnimationId);
        waveCanvas.style.opacity = '0';
        return;
      }

      waveCtx.clearRect(0, 0, rect.width, rect.height);

      const isSounding = !audioState.isMuted;
      const amplitudeMultiplier = isSounding ? 1.0 : 0.22;
      const speedMultiplier = isSounding ? 1.0 : 0.25;

      const scentColors = {
        lavender: 'rgba(155, 89, 182, 0.45)',
        vanilla: 'rgba(241, 196, 15, 0.45)',
        sandalwood: 'rgba(230, 126, 34, 0.45)',
        coffee: 'rgba(121, 85, 72, 0.45)',
        'first-rain': 'rgba(52, 152, 219, 0.45)',
        rose: 'rgba(231, 76, 60, 0.45)',
        lemongrass: 'rgba(46, 204, 113, 0.45)'
      };

      const primaryColor = scentColors[state.customizer.scents.heart] || 'rgba(212, 175, 55, 0.45)';
      const secondaryColor = scentColors[state.customizer.scents.depth] || 'rgba(212, 175, 55, 0.25)';

      phase += 0.05 * speedMultiplier;

      // Draw 3 layered waves for visual depth
      drawSingleWave(rect.width, rect.height, phase, 16 * amplitudeMultiplier, 0.012, primaryColor, 0);
      drawSingleWave(rect.width, rect.height, phase + 2, 10 * amplitudeMultiplier, 0.02, secondaryColor, 8);
      drawSingleWave(rect.width, rect.height, phase + 4, 6 * amplitudeMultiplier, 0.015, 'rgba(212, 175, 55, 0.3)', -4);

      waveAnimationId = requestAnimationFrame(animate);
    }

    animate();
  }

  function drawSingleWave(width, height, phase, amplitude, frequency, color, offsetY) {
    waveCtx.beginPath();
    waveCtx.strokeStyle = color;
    waveCtx.lineWidth = 2.0;
    waveCtx.lineCap = 'round';

    waveCtx.shadowBlur = 8;
    waveCtx.shadowColor = color;

    for (let x = 0; x < width; x++) {
      const y = (height / 2) + Math.sin(x * frequency + phase) * amplitude + offsetY;
      if (x === 0) {
        waveCtx.moveTo(x, y);
      } else {
        waveCtx.lineTo(x, y);
      }
    }
    waveCtx.stroke();
    waveCtx.shadowBlur = 0; // reset
  }

  // --- HOMEPAGE ADMIN PORTAL MODAL ACTIONS ---
  const homepageAdminTrigger = document.getElementById('homepage-admin-trigger');
  const homepageAdminOverlay = document.getElementById('homepage-admin-modal-overlay');
  const closeHomepageAdminBtn = document.getElementById('close-homepage-admin-btn');
  const homepageLoginForm = document.getElementById('homepage-admin-login-form');
  const homepageLoginBox = document.getElementById('homepage-admin-login-box');
  const homepageDashboardBox = document.getElementById('homepage-admin-dashboard-box');
  const homepageErrorMsg = document.getElementById('homepage-login-error-msg');
  const homepageTogglePassBtn = document.getElementById('homepage-toggle-pass-visibility');
  const homepagePassInput = document.getElementById('homepage-admin-pass');
  const homepageLogoutBtn = document.getElementById('homepage-btn-admin-logout');
  const homepageClearLogsBtn = document.getElementById('homepage-btn-clear-logs');

  const homepageLogsTableBody = document.getElementById('homepage-logs-table-body');
  const homepageBookingsTableBody = document.getElementById('homepage-bookings-table-body');
  const homepagePaymentsTableBody = document.getElementById('homepage-payments-table-body');
  const homepageDashboardTitle = document.getElementById('homepage-dashboard-title');

  let activeHomeTab = 'inquiries';

  if (homepageAdminTrigger) {
    homepageAdminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openHomepageAdminModal();
    });
  }

  if (closeHomepageAdminBtn) {
    closeHomepageAdminBtn.addEventListener('click', closeHomepageAdminModal);
  }

  if (homepageAdminOverlay) {
    homepageAdminOverlay.addEventListener('click', (e) => {
      if (e.target === homepageAdminOverlay) {
        closeHomepageAdminModal();
      }
    });
  }

  function openHomepageAdminModal() {
    if (homepageAdminOverlay) {
      homepageAdminOverlay.classList.remove('hidden');
      checkHomepageAdminAuth();
    }
  }

  function closeHomepageAdminModal() {
    if (homepageAdminOverlay) {
      homepageAdminOverlay.classList.add('hidden');
    }
  }

  function checkHomepageAdminAuth() {
    const isAuth = sessionStorage.getItem('superadmin_authenticated') === 'true';
    if (isAuth) {
      if (homepageLoginBox) homepageLoginBox.classList.add('hidden');
      if (homepageDashboardBox) homepageDashboardBox.classList.remove('hidden');
      renderHomepageActiveTab();
    } else {
      if (homepageLoginBox) homepageLoginBox.classList.remove('hidden');
      if (homepageDashboardBox) homepageDashboardBox.classList.add('hidden');
    }
  }

  // Handle Authentication submit via Server API
  if (homepageLoginForm) {
    homepageLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('homepage-admin-user').value.trim();
      const password = homepagePassInput.value.trim();

      try {
        const res = await fetch('http://localhost:5000/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const result = await res.json();

        if (res.ok && result.success) {
          sessionStorage.setItem('superadmin_authenticated', 'true');
          homepageErrorMsg.textContent = '';
          homepageLoginForm.reset();
          checkHomepageAdminAuth();
          showToast("Authenticated successfully. Welcome, Super Admin!");
        } else {
          homepageErrorMsg.textContent = result.message || 'Invalid credentials. Please try again.';
        }
      } catch (err) {
        console.error(err);
        homepageErrorMsg.textContent = 'Server connection error. Please run local server first.';
      }
    });
  }

  // Toggle Password text/password visibility
  if (homepageTogglePassBtn && homepagePassInput) {
    homepageTogglePassBtn.addEventListener('click', () => {
      const type = homepagePassInput.getAttribute('type') === 'password' ? 'text' : 'password';
      homepagePassInput.setAttribute('type', type);
      const icon = homepageTogglePassBtn.querySelector('i');
      if (icon) {
        if (type === 'password') {
          icon.setAttribute('data-lucide', 'eye');
        } else {
          icon.setAttribute('data-lucide', 'eye-off');
        }
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    });
  }

  // Set up dashboard Tab Switching Navigation callbacks
  const homeTabButtons = document.querySelectorAll('[data-homedashboardtab]');
  homeTabButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      homeTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeHomeTab = btn.getAttribute('data-homedashboardtab');

      // Hide all panels, show active
      const panels = homepageDashboardBox.querySelectorAll('.tab-panel');
      panels.forEach(p => p.classList.add('hidden'));

      const activePanel = document.getElementById(`homepanel-${activeHomeTab}-content`);
      if (activePanel) activePanel.classList.remove('hidden');

      // Update Header Title depending on active tab
      if (homepageDashboardTitle) {
        if (activeHomeTab === 'inquiries') homepageDashboardTitle.textContent = "Bulk Inquiries Database";
        if (activeHomeTab === 'bookings') homepageDashboardTitle.textContent = "Order Bookings Database";
        if (activeHomeTab === 'payments') homepageDashboardTitle.textContent = "Payment Transaction Records";
      }

      await renderHomepageActiveTab();
    });
  });

  async function renderHomepageActiveTab() {
    if (activeHomeTab === 'inquiries') {
      await renderHomepageInquiries();
    } else if (activeHomeTab === 'bookings') {
      await renderHomepageBookings();
    } else if (activeHomeTab === 'payments') {
      await renderHomepagePayments();
    }
  }

  async function renderHomepageInquiries() {
    if (!homepageLogsTableBody) return;
    homepageLogsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading inquiries...</td></tr>';

    let logs = [];
    try {
      const res = await fetch('http://localhost:5000/api/inquiries');
      if (res.ok) {
        logs = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    if (logs.length === 0) {
      homepageLogsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">📁</div>
            No inquiries received yet.
          </td>
        </tr>
      `;
      return;
    }

    homepageLogsTableBody.innerHTML = '';
    logs.forEach(log => {
      const tr = document.createElement('tr');
      const badgeClass = log.type === 'bulk' ? 'bulk' : 'gifting';
      const badgeLabel = log.type === 'bulk' ? 'Bulk Modal' : 'Gifting Form';
      const dateStr = new Date(log.timestamp).toLocaleString();

      let clientInfo = '';
      let requestDetails = '';
      let msgDetails = '';

      if (log.type === 'bulk') {
        clientInfo = `
          <strong>${log.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.email}</span><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.phone}</span>
        `;
        requestDetails = `
          <strong>Qty:</strong> ${log.qty}<br>
          <strong>Subj:</strong> ${log.subject}
        `;
        msgDetails = `<div class="message-cell">${log.message || ''}</div>`;
      } else {
        clientInfo = `
          <strong>${log.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${log.email}</span>
        `;
        requestDetails = `
          <strong>Company:</strong> ${log.org || 'N/A'}<br>
          <strong>Est. Qty:</strong> ${log.qty || 'N/A'} units
        `;
        msgDetails = `<div class="message-cell">${log.details || ''}</div>`;
      }

      tr.innerHTML = `
        <td style="padding: 1.25rem;"><span class="inquiry-badge ${badgeClass}">${badgeLabel}</span></td>
        <td style="padding: 1.25rem; white-space: nowrap;">${dateStr}</td>
        <td style="padding: 1.25rem;">${clientInfo}</td>
        <td style="padding: 1.25rem;">${requestDetails}</td>
        <td style="padding: 1.25rem;">${msgDetails}</td>
      `;
      homepageLogsTableBody.appendChild(tr);
    });
  }

  async function renderHomepageBookings() {
    if (!homepageBookingsTableBody) return;
    homepageBookingsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading bookings...</td></tr>';

    let bookings = [];
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      if (res.ok) {
        bookings = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    if (bookings.length === 0) {
      homepageBookingsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">🛍️</div>
            No candle orders booked yet.
          </td>
        </tr>
      `;
      return;
    }

    homepageBookingsTableBody.innerHTML = '';
    bookings.forEach(booking => {
      const tr = document.createElement('tr');
      const dateStr = new Date(booking.timestamp).toLocaleString();

      const clientInfo = `
        <strong>${booking.customerInfo.name}</strong><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${booking.customerInfo.email}</span><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${booking.customerInfo.phone}</span><br>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${booking.customerInfo.address}</span>
      `;

      const itemsList = booking.items.map(item => {
        if (item.isCustom) {
          return `• Custom: <strong>${item.name}</strong> (${item.description}) x${item.quantity}`;
        } else {
          return `• Signature: <strong>${item.name}</strong> (${item.description || 'Standard'}) x${item.quantity}`;
        }
      }).join('<br>');

      tr.innerHTML = `
        <td style="padding: 1.25rem; font-weight: bold; color: var(--gold-primary);">${booking.orderId}</td>
        <td style="padding: 1.25rem; white-space: nowrap;">${dateStr}</td>
        <td style="padding: 1.25rem;">${clientInfo}</td>
        <td style="padding: 1.25rem; font-size: 0.8rem; line-height: 1.4;">${itemsList}</td>
        <td style="padding: 1.25rem; font-weight: bold;">₹${booking.total}</td>
      `;
      homepageBookingsTableBody.appendChild(tr);
    });
  }

  async function renderHomepagePayments() {
    if (!homepagePaymentsTableBody) return;
    homepagePaymentsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading payments...</td></tr>';

    let payments = [];
    try {
      const res = await fetch('http://localhost:5000/api/payments');
      if (res.ok) {
        payments = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    if (payments.length === 0) {
      homepagePaymentsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 4rem 1.25rem; color: var(--text-secondary);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; text-align: center;">💳</div>
            No payment records found yet.
          </td>
        </tr>
      `;
      return;
    }

    homepagePaymentsTableBody.innerHTML = '';
    payments.forEach(payment => {
      const tr = document.createElement('tr');
      const dateStr = new Date(payment.timestamp).toLocaleString();
      const statusClass = payment.status === 'Success' ? 'bulk' : 'gifting';

      tr.innerHTML = `
        <td style="padding: 1.25rem; font-weight: bold;">${payment.transactionId}</td>
        <td style="padding: 1.25rem; color: var(--gold-primary); font-weight: bold;">${payment.orderId}</td>
        <td style="padding: 1.25rem; white-space: nowrap;">${dateStr}</td>
        <td style="padding: 1.25rem; font-weight: bold;">₹${payment.amount}</td>
        <td style="padding: 1.25rem;">${payment.paymentMethod}</td>
        <td style="padding: 1.25rem;"><span class="inquiry-badge ${statusClass}">${payment.status}</span></td>
      `;
      homepagePaymentsTableBody.appendChild(tr);
    });
  }

  // Logout Handler
  if (homepageLogoutBtn) {
    homepageLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('superadmin_authenticated');
      checkHomepageAdminAuth();
      showToast("Logged out of Admin Session.");
    });
  }

  // Clear Logs Handler
  if (homepageClearLogsBtn) {
    homepageClearLogsBtn.addEventListener('click', async () => {
      let deleteUrl = '';
      let tabLabel = '';
      if (activeHomeTab === 'inquiries') {
        deleteUrl = 'http://localhost:5000/api/inquiries';
        tabLabel = 'inquiry logs';
      } else if (activeHomeTab === 'bookings') {
        deleteUrl = 'http://localhost:5000/api/bookings';
        tabLabel = 'order bookings';
      } else if (activeHomeTab === 'payments') {
        deleteUrl = 'http://localhost:5000/api/payments';
        tabLabel = 'payment transaction details';
      }

      if (confirm(`Are you sure you want to delete all local ${tabLabel}? This cannot be undone.`)) {
        try {
          const res = await fetch(deleteUrl, { method: 'DELETE' });
          if (res.ok) {
            await renderHomepageActiveTab();
            showToast(`${tabLabel} database cleared.`);
          }
        } catch (e) {
          console.error(e);
          showToast("Failed to clear database logs.");
        }
      }
    });
  }

  // --- STOREFRONT MODALS: SEARCH, WISHLIST, ACCOUNT ---
  const searchBtn = document.getElementById('search-btn');
  const searchModalOverlay = document.getElementById('search-modal-overlay');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const storefrontSearchInput = document.getElementById('storefront-search-input');
  const searchResultsContainer = document.getElementById('search-results-container');

  const wishlistBtn = document.getElementById('wishlist-btn');
  const wishlistModalOverlay = document.getElementById('wishlist-modal-overlay');
  const closeWishlistBtn = document.getElementById('close-wishlist-btn');
  const closeWishlistBtnBottom = document.getElementById('close-wishlist-btn-bottom');
  const wishlistAddBag1 = document.getElementById('wishlist-add-bag-1');
  const wishlistAddBag2 = document.getElementById('wishlist-add-bag-2');

  const profileBtn = document.getElementById('profile-btn');
  const profileModalOverlay = document.getElementById('profile-modal-overlay');
  const closeProfileBtn = document.getElementById('close-profile-btn');
  const closeProfileBtnBottom = document.getElementById('close-profile-btn-bottom');

  const availableCandleProducts = [
    { name: "Royal Oud & Amber", category: "Signature Collection", price: "$32.00", color: "linear-gradient(135deg, #13221C 0%, #3a5c4e 100%)" },
    { name: "Forest Lavender", category: "Signature Collection", price: "$28.00", color: "linear-gradient(135deg, #5c4e7c 0%, #3a2b54 100%)" },
    { name: "Sandalwood Silk", category: "Custom Soy Blend", price: "$35.00", color: "linear-gradient(135deg, #C8A338 0%, #B28E2E 100%)" },
    { name: "Amber Wood & Cedar", category: "Premium Series", price: "$34.00", color: "linear-gradient(135deg, #b28e2e 0%, #6e5414 100%)" },
    { name: "Vanilla Spice", category: "Classic Series", price: "$24.00", color: "linear-gradient(135deg, #F3E5AB 0%, #c4b57c 100%)" }
  ];

  function openStorefrontModal(modal) {
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeStorefrontModal(modal) {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (searchBtn) searchBtn.addEventListener('click', () => openStorefrontModal(searchModalOverlay));
  if (wishlistBtn) wishlistBtn.addEventListener('click', () => openStorefrontModal(wishlistModalOverlay));
  if (profileBtn) profileBtn.addEventListener('click', () => openStorefrontModal(profileModalOverlay));

  if (closeSearchBtn) closeSearchBtn.addEventListener('click', () => closeStorefrontModal(searchModalOverlay));
  if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', () => closeStorefrontModal(wishlistModalOverlay));
  if (closeWishlistBtnBottom) closeWishlistBtnBottom.addEventListener('click', () => closeStorefrontModal(wishlistModalOverlay));
  if (closeProfileBtn) closeProfileBtn.addEventListener('click', () => closeStorefrontModal(profileModalOverlay));
  if (closeProfileBtnBottom) closeProfileBtnBottom.addEventListener('click', () => {
    closeStorefrontModal(profileModalOverlay);
    showToast("Signed out of your customer account.");
  });

  if (wishlistAddBag1) {
    wishlistAddBag1.addEventListener('click', () => {
      showToast("Added Sandalwood Silk to bag!");
      closeStorefrontModal(wishlistModalOverlay);
    });
  }
  if (wishlistAddBag2) {
    wishlistAddBag2.addEventListener('click', () => {
      showToast("Added Royal Oud & Amber to bag!");
      closeStorefrontModal(wishlistModalOverlay);
    });
  }

  if (storefrontSearchInput && searchResultsContainer) {
    storefrontSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        searchResultsContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1.5rem 0;">Type a query to see matching artisan candles.</div>';
        return;
      }

      const matches = availableCandleProducts.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );

      if (matches.length === 0) {
        searchResultsContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1.5rem 0;">No matching candles found. Try search terms like Lavender, Oud, or Silk.</div>';
        return;
      }

      searchResultsContainer.innerHTML = matches.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; background: ${item.color}; border-radius: 6px;"></div>
            <div>
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${item.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${item.category}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--gold-text);">${item.price}</span>
            <button class="btn btn-primary" onclick="showToast('Added matching item!')" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">View</button>
          </div>
        </div>
      `).join('');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppFlow);
} else {
  initAppFlow();
}


