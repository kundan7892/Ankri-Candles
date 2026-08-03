import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ankri';

// Disable command buffering so queries fail quickly if db is disconnected
mongoose.set('bufferCommands', false);

export function connectDB() {
    return mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000
    })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log('MongoDB connection error:', err));
}

// Helper to ensure database is connected before processing requests
export async function ensureDbConnected() {
    if (mongoose.connection.readyState === 1) return true;
    if (mongoose.connection.readyState === 2) {
        let waited = 0;
        while (mongoose.connection.readyState === 2 && waited < 3000) {
            await new Promise(r => setTimeout(r, 100));
            waited += 100;
        }
        if (mongoose.connection.readyState === 1) return true;
    }
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        return mongoose.connection.readyState === 1;
    } catch (err) {
        return false;
    }
}
