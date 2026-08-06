import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import dns from 'dns';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { connectDB, ensureDbConnected } from './mongodb/db.js';
import { User, Inquiry, Booking, Payment, AbandonedCart, WhatsAppLog, SpinReward, ProductRating } from './mongodb/models.js';

dotenv.config();

// Force IPv4 for DNS resolution to fix ENETUNREACH errors on IPv6 networks (like Render or local misconfigs)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.log('DNS fallback not supported on this Node version');
}

connectDB();

const JWT_SECRET = process.env.JWT_SECRET || 'ankri-super-secret-key-2026';

// Use Gmail SMTP port 587 (STARTTLS) — more reliable and better deliverability than port 465
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS — upgrades connection automatically
  auth: {
    user: process.env.EMAIL_USER || 'ankricandle@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message);
  } else {
    console.log('✅ SMTP ready — emails will deliver successfully');
  }
});

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
    const oneMinuteAgo = new Date(Date.now() - 1200000); // 20 minutes threshold
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


// --- ACCOUNT CREATION / VERIFICATION ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name || '').trim();

    // Generate 6 digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let finalHashedPassword = password;
    if (password) {
      const salt = await bcrypt.genSalt(8);
      finalHashedPassword = await bcrypt.hash(password, salt);
    }

    const isConnected = await ensureDbConnected();
    if (isConnected) {
      try {
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
          user = new User({ email: cleanEmail, name: cleanName, password: finalHashedPassword });
        } else {
          user.name = cleanName || user.name;
          if (finalHashedPassword) user.password = finalHashedPassword;
        }
        user.otp = verificationCode;
        user.otpExpiry = otpExpiry;
        await user.save();
      } catch (dbErr) {
        console.error('MongoDB save error in /api/register:', dbErr.message);
      }
    }

    // Always save to local backup JSON as fallback
    saveToBackupFile('users_temp.json', { email: cleanEmail, name: cleanName, password: finalHashedPassword, otp: verificationCode, otpExpiry, timestamp: new Date() });

    // Generate a stateless signed OTP token as a fail-safe for serverless/Vercel environments
    const otpToken = jwt.sign(
      { email: cleanEmail, name: cleanName, otp: verificationCode },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    console.log(`🔑 [ANKRI OTP] Code for ${cleanEmail} is: ${verificationCode}`);

    const mailOptions = {
      from: `"Ankri Candle" <${process.env.EMAIL_USER || 'ankricandle@gmail.com'}>`,
      replyTo: process.env.EMAIL_USER || 'ankricandle@gmail.com',
      to: cleanEmail,
      subject: `${verificationCode} is your Ankri Candle verification code`,
      text: `Your Ankri Candle verification code is: ${verificationCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; padding: 30px; border: 1px solid #e0d6c8; border-radius: 12px;">
          <h2 style="color: #5c3d2e;">Ankri Candle</h2>
          <p>Welcome, ${cleanName || 'Artisan'}!</p>
          <p>Your verification code is:</p>
          <h1 style="color: #D4AF37; letter-spacing: 8px; font-size: 48px; margin: 20px 0;">${verificationCode}</h1>
          <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    };

    // Send email asynchronously in the background so the UI doesn't freeze
    transporter.sendMail(mailOptions).then(() => {
      console.log(`✉️ [ANKRI OTP] Successfully emailed OTP code to ${cleanEmail}`);
    }).catch((mailErr) => {
      console.error(`⚠️ [ANKRI OTP SMTP NOTICE] Could not deliver email to ${cleanEmail}:`, mailErr.message);
    });

    res.status(200).json({ success: true, message: 'Verification code generated and sent', otpToken });
  } catch (error) {
    console.error('Error in /api/register:', error);
    res.status(500).json({ success: false, message: 'Error sending verification code' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const isConnected = await ensureDbConnected();

    let user = null;
    if (isConnected) {
      // Primary: check MongoDB
      user = await User.findOne({ email: cleanEmail });

      // Fallback: if not in MongoDB, check local backup (e.g. registered while DB was offline)
      if (!user) {
        console.log(`[FORGOT-PASSWORD] User not found in MongoDB, checking local backup for: ${cleanEmail}`);
        const tempUsers = readFromBackupFile('users_temp.json');
        const matchingRecords = tempUsers.filter(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
        const backupUser = matchingRecords.length > 0 ? matchingRecords[matchingRecords.length - 1] : null;
        if (backupUser) {
          // Sync the user back into MongoDB
          try {
            user = new User({ email: cleanEmail, name: backupUser.name || '' });
            await user.save();
            console.log(`[FORGOT-PASSWORD] Synced backup user to MongoDB: ${cleanEmail}`);
          } catch (syncErr) {
            user = await User.findOne({ email: cleanEmail }) || backupUser;
          }
        }
      }
    } else {
      // DB offline: read entirely from local backup
      const tempUsers = readFromBackupFile('users_temp.json');
      const matchingRecords = tempUsers.filter(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
      user = matchingRecords.length > 0 ? matchingRecords[matchingRecords.length - 1] : null;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please create an account first.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (isConnected) {
      user.otp = verificationCode;
      user.otpExpiry = otpExpiry;
      user.forgotPasswordMode = true;
      await user.save();
    } else {
      saveToBackupFile('users_temp.json', { email: cleanEmail, name: user.name, otp: verificationCode, otpExpiry, forgotPasswordMode: true, timestamp: new Date() });
    }

    const otpToken = jwt.sign(
      { email: cleanEmail, otp: verificationCode, forgotPasswordMode: true },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const mailOptions = {
      from: `"Ankri Candle" <${process.env.EMAIL_USER || 'ankricandle@gmail.com'}>`,
      replyTo: process.env.EMAIL_USER || 'ankricandle@gmail.com',
      to: cleanEmail,
      subject: `${verificationCode} is your Ankri Candle login code`,
      text: `Your Ankri Candle login code is: ${verificationCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; padding: 30px; border: 1px solid #e0d6c8; border-radius: 12px;">
          <h2 style="color: #5c3d2e;">Ankri Candle</h2>
          <p>We received a login request for your account.</p>
          <p>Your one-time login code is:</p>
          <h1 style="color: #D4AF37; letter-spacing: 8px; font-size: 48px; margin: 20px 0;">${verificationCode}</h1>
          <p style="color: #888; font-size: 13px;">This code expires in 10 minutes and can only be used once.</p>
        </div>
      `
    };

    // Send email asynchronously in the background
    transporter.sendMail(mailOptions).catch(mailErr => {
      console.error('Mail error in forgot-password:', mailErr);
    });

    res.status(200).json({ success: true, message: 'Verification code sent', otpToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending code' });
  }
});

app.post('/api/verify', async (req, res) => {
  try {
    const { email, code, otpToken } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const isConnected = await ensureDbConnected();

    // Strategy 1: Check MongoDB first if connected
    if (isConnected) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user && user.otp && String(user.otp).trim() === cleanCode) {
          if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ success: false, message: 'Verification code expired' });
          }

          user.otp = undefined;
          user.otpExpiry = undefined;
          user.forgotPasswordMode = false;
          await user.save();

          const token = jwt.sign({ email: cleanEmail, name: user.name || 'Ankri Artisan' }, JWT_SECRET, { expiresIn: '7d' });
          return res.status(200).json({ success: true, message: 'Account verified successfully', token, user: { name: user.name || 'Ankri Artisan', email: user.email } });
        }
      } catch (dbErr) {
        console.error('MongoDB query error in /api/verify:', dbErr.message);
      }
    }

    // Strategy 2: Check Stateless Signed JWT Token (Vercel Serverless / Stateless fail-safe)
    if (otpToken) {
      try {
        const decoded = jwt.verify(otpToken, JWT_SECRET);
        if (decoded && decoded.email === cleanEmail && String(decoded.otp).trim() === cleanCode) {
          if (isConnected) {
            try {
              let user = await User.findOne({ email: cleanEmail });
              if (!user) {
                user = new User({ email: cleanEmail, name: decoded.name });
              }
              user.otp = undefined;
              user.otpExpiry = undefined;
              user.forgotPasswordMode = false;
              await user.save();
            } catch (err) { }
          }
          const token = jwt.sign({ email: cleanEmail, name: decoded.name || 'Ankri Artisan' }, JWT_SECRET, { expiresIn: '7d' });
          return res.status(200).json({ success: true, message: 'Account verified successfully', token, user: { name: decoded.name || 'Ankri Artisan', email: cleanEmail } });
        }
      } catch (jwtErr) {
        if (jwtErr.name === 'TokenExpiredError') {
          return res.status(400).json({ success: false, message: 'Verification code expired. Please request a new code.' });
        }
      }
    }

    // Strategy 3: Check local backup file (Local Dev Fallback)
    const tempUsers = readFromBackupFile('users_temp.json');
    const matchingRecords = tempUsers.filter(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
    const latestRecord = matchingRecords.length > 0 ? matchingRecords[matchingRecords.length - 1] : null;

    if (latestRecord && String(latestRecord.otp || '').trim() === cleanCode) {
      if (latestRecord.otpExpiry && new Date() > new Date(latestRecord.otpExpiry)) {
        return res.status(400).json({ success: false, message: 'Verification code expired' });
      }

      if (isConnected) {
        try {
          let user = await User.findOne({ email: cleanEmail });
          if (!user) {
            user = new User({ email: cleanEmail, name: latestRecord.name });
          }
          user.otp = undefined;
          user.otpExpiry = undefined;
          user.forgotPasswordMode = false;
          await user.save();
        } catch (err) { }
      }

      const token = jwt.sign({ email: cleanEmail, name: latestRecord.name || 'Ankri Artisan' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ success: true, message: 'Account verified successfully', token, user: { name: latestRecord.name || 'Ankri Artisan', email: cleanEmail } });
    }

    return res.status(400).json({ success: false, message: 'Invalid verification code' });
  } catch (error) {
    console.error('Error in /api/verify:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const isConnected = await ensureDbConnected();

    let user = null;
    if (isConnected) {
      // Primary: check MongoDB
      user = await User.findOne({ email: cleanEmail });

      // Fallback: if not in MongoDB, check local backup (e.g. registered while DB was offline)
      if (!user) {
        console.log(`[LOGIN] User not found in MongoDB, checking local backup for: ${cleanEmail}`);
        const tempUsers = readFromBackupFile('users_temp.json');
        const matchingRecords = tempUsers.filter(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
        const backupUser = matchingRecords.length > 0 ? matchingRecords[matchingRecords.length - 1] : null;
        if (backupUser) {
          // Sync the user back into MongoDB so future lookups succeed
          try {
            user = new User({ email: cleanEmail, name: backupUser.name || '', password: backupUser.password });
            await user.save();
            console.log(`[LOGIN] Synced backup user to MongoDB: ${cleanEmail}`);
          } catch (syncErr) {
            // If unique key violation (already exists), just fetch it
            user = await User.findOne({ email: cleanEmail }) || backupUser;
            console.log(`[LOGIN] Sync conflict — fetched existing user for: ${cleanEmail}`);
          }
        }
      }
    } else {
      // DB offline: read entirely from local backup
      const tempUsers = readFromBackupFile('users_temp.json');
      const matchingRecords = tempUsers.filter(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
      user = matchingRecords.length > 0 ? matchingRecords[matchingRecords.length - 1] : null;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please create an account first.' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Account requires password reset. Please use Forgot Password.' });
    }

    // Compare passwords safely
    const isMatch = await bcrypt.compare(password, user.password);
    const isPlaintextMatch = (password === user.password);

    if (!isMatch && !isPlaintextMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // Auto-migrate legacy plaintext passwords to hashed versions seamlessly
    if (!isMatch && isPlaintextMatch) {
      const salt = await bcrypt.genSalt(8);
      user.password = await bcrypt.hash(password, salt);
      if (typeof user.save === 'function') {
        await user.save();
      }
    }

    const token = jwt.sign(
      { email: cleanEmail, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ success: true, message: 'Login successful', token, user: { name: user.name, email: cleanEmail } });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Order History Route
app.get('/api/history', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    if (mongoose.connection.readyState !== 1) {
      const data = readFromBackupFile('bookings.json');
      const userOrders = data.filter(b => b.customerInfo && b.customerInfo.email === email);
      return res.status(200).json({ success: true, orders: userOrders });
    }

    const orders = await Booking.find({ 'customerInfo.email': email }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

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

// --- SPIN WHEEL REWARDS ROUTES ---
app.post('/api/spin-rewards', async (req, res) => {
  try {
    const { phone, country, reward } = req.body;
    if (!phone || !country || !reward) {
      return res.status(400).json({ message: 'Missing phone, country, or reward information' });
    }

    if (mongoose.connection.readyState !== 1) {
      saveToBackupFile('spin_rewards.json', req.body);
      return res.status(201).json({ message: 'Spin reward saved (Local Backup Fallback)', data: req.body });
    }

    const newReward = new SpinReward({ phone, country, reward });
    await newReward.save();
    res.status(201).json({ message: 'Spin reward registered successfully', data: newReward });
  } catch (error) {
    console.error('Error registering spin reward:', error);
    res.status(500).json({ message: 'Error registering spin reward' });
  }
});

app.get('/api/spin-rewards', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = readFromBackupFile('spin_rewards.json');
      return res.status(200).json(data);
    }
    const rewards = await SpinReward.find().sort({ timestamp: -1 });
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error fetching spin rewards:', error);
    res.status(500).json({ message: 'Error fetching spin rewards' });
  }
});

app.delete('/api/spin-rewards', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const filePath = path.join(process.cwd(), 'data', 'spin_rewards.json');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ message: 'Local spin rewards file cleared successfully' });
    }
    await SpinReward.deleteMany({});
    res.status(200).json({ message: 'Spin rewards cleared successfully' });
  } catch (error) {
    console.error('Error deleting spin rewards:', error);
    res.status(500).json({ message: 'Error deleting spin rewards' });
  }
});

app.post('/api/spin-rewards/validate', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ valid: false, message: 'Missing phone or code' });
    }

    const rewardMap = {
      'ANKRI10': '10% OFF',
      'ANKRISHIP': 'Free Shipping',
      'ANKRIB2G1': 'Buy 2 Get 1'
    };
    const rewardName = rewardMap[code.toUpperCase()];
    if (!rewardName) {
      return res.status(200).json({ valid: true });
    }

    const cleanInputPhone = phone.replace(/\D/g, '');
    if (!cleanInputPhone) {
      return res.status(400).json({ valid: false, message: 'Invalid phone number format' });
    }

    let rewards = [];
    if (mongoose.connection.readyState !== 1) {
      rewards = readFromBackupFile('spin_rewards.json');
    } else {
      rewards = await SpinReward.find({ reward: rewardName });
    }

    const matched = rewards.some(r => {
      const cleanDBPhone = r.phone.replace(/\D/g, '');
      return cleanDBPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(cleanDBPhone);
    });

    if (matched) {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({
        valid: false,
        message: `Promotion code ${code} is locked to the phone number that won it. Please enter the same phone number used for the spin reward.`
      });
    }
  } catch (error) {
    console.error('Error validating spin reward:', error);
    res.status(500).json({ valid: false, message: 'Internal server validation error' });
  }
});

// AI Support Chat Integration Route
app.post('/api/support-chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
      console.warn('[Support Chat] Gemini API key not found or using placeholder. Falling back to local offline mode.');
      return res.status(200).json({ useFallback: true });
    }

    // Call Google Gemini API (gemini-3.1-flash-lite) using standard fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System Prompt: You are Ankri Support, a helpful AI assistant for Ankri Candles. Ankri Candles sells premium hand-poured soy candles. We offer an interactive Candle Customizer builder where customers select wax ratios (Heart, Depth, Twist) and vessel color styles (Classic Gold, Classic Silver, Shiny Black, Warm Amber). Shipping is free on orders above Rs.999. In Bangalore, delivery takes 1-2 corporate working days, and 3-5 days across all other parts of India. Order returns/replacements are only supported for damaged items by emailing support@ankricandles.com. Keep replies short, warm, and professional, under 70 words. Do not use markdown headers, lists, or bold tags in responses. Respond to the customer below.\n\nCustomer: ${message}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Support Chat] Gemini API request failed: ${errText}`);
      return res.status(200).json({ useFallback: true });
    }

    const data = await response.json();
    let reply = '';

    // Extract text from Gemini structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      reply = data.candidates[0].content.parts[0].text;
    }

    if (!reply) {
      return res.status(200).json({ useFallback: true });
    }

    // Safe formatting clean
    reply = reply.replace(/\*\*/g, '').replace(/###/g, '').trim();

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('[Support Chat] Backend error:', error);
    return res.status(200).json({ useFallback: true });
  }
});

// --- PRODUCT RATINGS ROUTES ---

// Helper: read ratings from local JSON
function readRatingsFromFile() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'ratings.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '{}');
    }
  } catch (err) {
    console.error('Error reading ratings file:', err);
  }
  return {};
}

// Helper: write ratings to local JSON
function writeRatingsToFile(data) {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'ratings.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing ratings file:', err);
  }
}

// GET /api/ratings — fetch all product ratings
app.get('/api/ratings', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const data = readRatingsFromFile();
      return res.status(200).json(data);
    }
    const ratings = await ProductRating.find({});
    const result = {};
    ratings.forEach(r => {
      result[r.productId] = { totalStars: r.totalStars, voteCount: r.voteCount };
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// POST /api/ratings/:productId — submit a star vote
app.post('/api/ratings/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { stars } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Invalid star value. Must be 1-5.' });
    }

    if (mongoose.connection.readyState !== 1) {
      // Local JSON fallback
      const data = readRatingsFromFile();
      if (!data[productId]) {
        data[productId] = { totalStars: 40, voteCount: 10 }; // seed default
      }
      data[productId].totalStars += stars;
      data[productId].voteCount += 1;
      writeRatingsToFile(data);
      const avg = parseFloat((data[productId].totalStars / data[productId].voteCount).toFixed(1));
      return res.status(200).json({ avg, voteCount: data[productId].voteCount });
    }

    // MongoDB path
    let rating = await ProductRating.findOne({ productId });
    if (!rating) {
      rating = new ProductRating({ productId, totalStars: 40, voteCount: 10 }); // seed default
    }
    rating.totalStars += stars;
    rating.voteCount += 1;
    await rating.save();

    const avg = parseFloat((rating.totalStars / rating.voteCount).toFixed(1));
    return res.status(200).json({ avg, voteCount: rating.voteCount });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
