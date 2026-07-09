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

// Routes
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
