import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Helper to save to local backup JSON when database is offline
function saveToBackupFile(filename, data) {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, filename);
    let currentData = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      currentData = JSON.parse(content || '[]');
    }
    const record = { ...data };
    if (!record.timestamp) record.timestamp = new Date();
    currentData.push({ ...record, _localBackup: true });
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    console.log(`Successfully saved local backup to data/${filename}`);
  } catch (err) {
    console.error(`Local backup error for ${filename}:`, err);
  }
}

// Helper to read from local backup JSON when database is offline
function readFromBackupFile(filename) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error(`Local read error for ${filename}:`, err);
  }
  return [];
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ankri';

// Disable command buffering so queries fail quickly if db is disconnected
mongoose.set('bufferCommands', false);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
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

const AbandonedCart = mongoose.model('AbandonedCart', abandonedCartSchema);

const whatsappLogSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  customerName: { type: String, default: '' },
  message: { type: String, required: true },
  status: { type: String, default: 'Sent' },
  timestamp: { type: Date, default: Date.now }
});

const WhatsAppLog = mongoose.model('WhatsAppLog', whatsappLogSchema);

// Helper to save/update active carts in local backup when database is offline
function saveOrUpdateAbandonedCartInBackup(data) {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, 'abandoned_carts.json');
    let currentData = [];
    if (fs.existsSync(filePath)) {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    }
    const index = currentData.findIndex(item => item.phone === data.phone);
    if (index !== -1) {
      // Only reset the timestamp and update details if they are still in Pending or Reminded status
      currentData[index] = {
        ...currentData[index],
        ...data,
        status: 'Pending',
        timestamp: new Date().toISOString()
      };
    } else {
      currentData.push({
        ...data,
        status: 'Pending',
        timestamp: new Date().toISOString()
      });
    }
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Backup write error for abandoned carts:', err);
  }
}

// Helper to mark backup carts completed on successful purchase
function markAbandonedCartCompletedInBackup(phone) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'abandoned_carts.json');
    if (fs.existsSync(filePath)) {
      let currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
      const index = currentData.findIndex(item => item.phone === phone && item.status !== 'Completed');
      if (index !== -1) {
        currentData[index].status = 'Completed';
        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error('Error marking backup cart completed:', err);
  }
}

// Scheduled Background Reminder Job (runs once every 30s)
async function checkAndSendWhatsAppReminders() {
  try {
    const oneMinuteAgo = new Date(Date.now() - 10000); // 10 seconds threshold
    if (mongoose.connection.readyState === 1) {
      const pendingCarts = await AbandonedCart.find({
        status: 'Pending',
        timestamp: { $lte: oneMinuteAgo }
      });
      for (const cart of pendingCarts) {
        const itemsSummary = cart.cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const message = `Hi ${cart.name || 'Valued Customer'}, you left premium candles [${itemsSummary}] in your cart (Total: ₹${cart.total}) at Ankri Candles! Complete your unboxing ritual today.`;

        const logEntry = new WhatsAppLog({
          phone: cart.phone,
          customerName: cart.name,
          message: message
        });
        await logEntry.save();

        cart.status = 'Reminded';
        await cart.save();
        console.log(`[WhatsApp Reminder Sent] to ${cart.name} (${cart.phone}): "${message}"`);
      }
    } else {
      const filePath = path.join(process.cwd(), 'data', 'abandoned_carts.json');
      if (fs.existsSync(filePath)) {
        let carts = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
        let updated = false;
        for (let cart of carts) {
          if (cart.status === 'Pending' && new Date(cart.timestamp) <= oneMinuteAgo) {
            const itemsSummary = cart.cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
            const message = `Hi ${cart.name || 'Valued Customer'}, you left premium candles [${itemsSummary}] in your cart (Total: ₹${cart.total}) at Ankri Candles! Complete your unboxing ritual today.`;

            const logEntry = {
              phone: cart.phone,
              customerName: cart.name,
              message: message,
              status: 'Sent',
              timestamp: new Date().toISOString()
            };
            saveToBackupFile('whatsapp_logs.json', logEntry);

            cart.status = 'Reminded';
            updated = true;
            console.log(`[WhatsApp Offline Reminder Sent] to ${cart.name} (${cart.phone}): "${message}"`);
          }
        }
        if (updated) {
          fs.writeFileSync(filePath, JSON.stringify(carts, null, 2), 'utf-8');
        }
      }
    }
  } catch (err) {
    console.error('Error running WhatsApp reminder job:', err);
  }
}

setInterval(checkAndSendWhatsAppReminders, 30000); // 30 seconds interval


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
    if (mongoose.connection.readyState !== 1) {
      console.log('Database offline. Saving inquiry to local backup inquiries.json...');
      saveToBackupFile('inquiries.json', req.body);
      return res.status(201).json({ message: 'Inquiry saved successfully (Local Backup Fallback)', data: req.body });
    }
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
    if (mongoose.connection.readyState !== 1) {
      const data = readFromBackupFile('inquiries.json');
      return res.status(200).json(data);
    }
    const inquiries = await Inquiry.find().sort({ timestamp: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
});

app.delete('/api/inquiries', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const filePath = path.join(process.cwd(), 'data', 'inquiries.json');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ message: 'Local inquiries file cleared successfully' });
    }
    await Inquiry.deleteMany({});
    res.status(200).json({ message: 'Inquiries cleared successfully' });
  } catch (error) {
    console.error('Error deleting inquiries:', error);
    res.status(500).json({ message: 'Error deleting inquiries' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database offline. Saving booking to local backup bookings.json...');
      saveToBackupFile('bookings.json', req.body);
      markAbandonedCartCompletedInBackup(req.body.phone);
      return res.status(201).json({ message: 'Booking saved successfully (Local Backup Fallback)', data: req.body });
    }
    const newBooking = new Booking(req.body);
    await newBooking.save();
    // Mark abandoned cart as Completed
    await AbandonedCart.findOneAndUpdate({ phone: req.body.phone, status: 'Pending' }, { status: 'Completed' });
    res.status(201).json({ message: 'Booking saved successfully', data: newBooking });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ message: 'Error saving booking' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = readFromBackupFile('bookings.json');
      return res.status(200).json(data);
    }
    const bookings = await Booking.find().sort({ timestamp: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const filePath = path.join(process.cwd(), 'data', 'bookings.json');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ message: 'Local bookings file cleared successfully' });
    }
    await Booking.deleteMany({});
    res.status(200).json({ message: 'Bookings cleared successfully' });
  } catch (error) {
    console.error('Error deleting bookings:', error);
    res.status(500).json({ message: 'Error deleting bookings' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database offline. Saving payment to local backup payments.json...');
      saveToBackupFile('payments.json', req.body);
      return res.status(201).json({ message: 'Payment registered successfully (Local Backup Fallback)', data: req.body });
    }
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
    if (mongoose.connection.readyState !== 1) {
      const data = readFromBackupFile('payments.json');
      return res.status(200).json(data);
    }
    const payments = await Payment.find().sort({ timestamp: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

app.delete('/api/payments', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const filePath = path.join(process.cwd(), 'data', 'payments.json');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ message: 'Local payments file cleared successfully' });
    }
    await Payment.deleteMany({});
    res.status(200).json({ message: 'Payments cleared successfully' });
  } catch (error) {
    console.error('Error deleting payments:', error);
    res.status(500).json({ message: 'Error deleting payments' });
  }
});

app.post('/api/abandoned-carts', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      saveOrUpdateAbandonedCartInBackup(req.body);
      return res.status(201).json({ message: 'Abandoned cart captured (Local Backup Fallback)', data: req.body });
    }
    const { phone, name, cartItems, total } = req.body;
    let cart = await AbandonedCart.findOne({ phone, status: 'Pending' });
    if (cart) {
      cart.name = name;
      cart.cartItems = cartItems;
      cart.total = total;
      cart.timestamp = new Date();
      await cart.save();
    } else {
      cart = new AbandonedCart({ phone, name, cartItems, total });
      await cart.save();
    }
    res.status(201).json({ message: 'Abandoned cart captured successfully', data: cart });
  } catch (error) {
    console.error('Error saving abandoned cart:', error);
    res.status(500).json({ message: 'Error saving abandoned cart' });
  }
});

app.get('/api/whatsapp-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = readFromBackupFile('whatsapp_logs.json');
      return res.status(200).json(data);
    }
    const logs = await WhatsAppLog.find().sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching WhatsApp logs:', error);
    res.status(500).json({ message: 'Error fetching WhatsApp logs' });
  }
});

app.delete('/api/whatsapp-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const filePath = path.join(process.cwd(), 'data', 'whatsapp_logs.json');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ message: 'Local WhatsApp logs cleared successfully' });
    }
    await WhatsAppLog.deleteMany({});
    res.status(200).json({ message: 'WhatsApp logs cleared successfully' });
  } catch (error) {
    console.error('Error deleting WhatsApp logs:', error);
    res.status(500).json({ message: 'Error deleting WhatsApp logs' });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
