import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ankri';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

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

const Inquiry = mongoose.model('Inquiry', inquirySchema);

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

const Booking = mongoose.model('Booking', bookingSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.ADMIN_USERNAME || 'superadmin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

  if (username === expectedUsername && password === expectedPassword) {
    res.status(200).json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const newInquiry = new Inquiry(req.body);
    await newInquiry.save();
    res.status(201).json({ message: 'Inquiry saved successfully', data: newInquiry });
  } catch (error) {
    console.error('Error saving inquiry:', error);
    res.status(500).json({ message: 'Error saving inquiry' });
  }
});

app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ timestamp: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
});

app.delete('/api/inquiries', async (req, res) => {
  try {
    await Inquiry.deleteMany({});
    res.status(200).json({ message: 'Inquiries cleared successfully' });
  } catch (error) {
    console.error('Error deleting inquiries:', error);
    res.status(500).json({ message: 'Error deleting inquiries' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json({ message: 'Booking saved successfully', data: newBooking });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ message: 'Error saving booking' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ timestamp: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    await Booking.deleteMany({});
    res.status(200).json({ message: 'Bookings cleared successfully' });
  } catch (error) {
    console.error('Error deleting bookings:', error);
    res.status(500).json({ message: 'Error deleting bookings' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.status(201).json({ message: 'Payment registered successfully', data: newPayment });
  } catch (error) {
    console.error('Error registering payment:', error);
    res.status(500).json({ message: 'Error registering payment' });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ timestamp: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

app.delete('/api/payments', async (req, res) => {
  try {
    await Payment.deleteMany({});
    res.status(200).json({ message: 'Payments cleared successfully' });
  } catch (error) {
    console.error('Error deleting payments:', error);
    res.status(500).json({ message: 'Error deleting payments' });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
