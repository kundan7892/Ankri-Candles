import mongoose from 'mongoose';

// --- USER SCHEMA (Customer Accounts) ---
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    name: { type: String, default: '' },
    password: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    forgotPasswordMode: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
export const User = mongoose.model('User', userSchema);

// Inquiry Schema
const inquirySchema = new mongoose.Schema({
    type: String,
    name: String,
    email: String,
    phone: String,
    qty: String,
    subject: String,
    org: String,
    details: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const Inquiry = mongoose.model('Inquiry', inquirySchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        description: String,
        colors: String,
        isCustom: Boolean,
        quantity: Number
    }],
    subtotal: Number,
    shipping: Number,
    total: Number,
    status: { type: String, default: 'Pending' },
    timestamp: { type: Date, default: Date.now }
});

export const Booking = mongoose.model('Booking', bookingSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Payment = mongoose.model('Payment', paymentSchema);

// --- WHATSAPP ABANDONED CART SCHEMAS ---
const abandonedCartSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    name: { type: String, default: '' },
    cartItems: [{
        id: String,
        name: String,
        price: Number,
        description: String,
        colors: String,
        isCustom: Boolean,
        quantity: Number
    }],
    total: { type: Number, default: 0 },
    status: { type: String, default: 'Pending' }, // 'Pending' | 'Completed' | 'Reminded'
    timestamp: { type: Date, default: Date.now }
});

export const AbandonedCart = mongoose.model('AbandonedCart', abandonedCartSchema);

const whatsappLogSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    customerName: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, default: 'Sent' },
    timestamp: { type: Date, default: Date.now }
});

export const WhatsAppLog = mongoose.model('WhatsAppLog', whatsappLogSchema);

// Spin Wheel Rewards Schema
const spinRewardSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    country: { type: String, required: true },
    reward: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const SpinReward = mongoose.model('SpinReward', spinRewardSchema);

// Product Rating Schema
const productRatingSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    totalStars: { type: Number, default: 40 }, // Default: 4 stars × 10 votes
    voteCount: { type: Number, default: 10 }
});

export const ProductRating = mongoose.model('ProductRating', productRatingSchema);
