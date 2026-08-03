import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ankri';
const cartPhone = "+918123909526";
const cartName = "Jane Doe";
const minutesAgo = 21;
const mockTimestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

const cartData = {
    phone: cartPhone,
    name: cartName,
    cartItems: [
        { id: "sandalwood-silk", name: "Sandalwood Silk", price: 35, quantity: 1 }
    ],
    total: 135,
    status: 'Pending',
    timestamp: mockTimestamp
};

async function insertMockCart() {
    console.log("=== WAITING FOR TEST INTEGRATION ===");
    console.log("1. Writing mock cart (21 minutes old) to local backup file...");

    // Write to JSON backup
    try {
        const dir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, 'abandoned_carts.json');
        let carts = [];
        if (fs.existsSync(filePath)) {
            carts = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
        }
        // Remove existing test carts
        carts = carts.filter(c => c.phone !== cartPhone);
        carts.push({
            ...cartData,
            timestamp: mockTimestamp.toISOString()
        });
        fs.writeFileSync(filePath, JSON.stringify(carts, null, 2), 'utf-8');
        console.log("Mock cart successfully written to local JSON backup.");
    } catch (err) {
        console.error("Backup file write error:", err);
    }

    // Also write to MongoDB if it is online
    try {
        console.log("2. Attempting to seed MongoDB with mock cart...");
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });

        // Define schema inline
        const schema = new mongoose.Schema({
            phone: String,
            name: String,
            cartItems: Array,
            total: Number,
            status: String,
            timestamp: Date
        });
        const AbandonedCart = mongoose.models.AbandonedCart || mongoose.model('AbandonedCart', schema);

        await AbandonedCart.deleteMany({ phone: cartPhone });
        const cart = new AbandonedCart(cartData);
        await cart.save();
        console.log("Mock cart successfully seeded inside MongoDB database.");
        await mongoose.disconnect();
    } catch (err) {
        console.log("MongoDB seeding skipped (offline or timeout):", err.message);
    }

    console.log("\n3. Waiting 35 seconds for the background scheduler to run...");
    await new Promise(resolve => setTimeout(resolve, 35000));

    console.log("\n4. Checking if WhatsApp reminder was sent...");
    try {
        const resLogs = await fetch('http://localhost:5000/api/whatsapp-logs');
        const logs = await resLogs.json();
        const mockLog = logs.find(l => l.phone === cartPhone);
        if (mockLog) {
            console.log("Match Found in Logs:", JSON.stringify(mockLog, null, 2));
            console.log("✓ SUCCESS: WhatsApp abandoned cart reminder sent successfully!");
        } else {
            console.log("✗ FAILED: No reminder sent matching phone in logs.");
        }
    } catch (error) {
        console.error("Check logs error:", error);
    }
}

insertMockCart();
