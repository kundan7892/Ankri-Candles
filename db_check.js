import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ankri';

async function checkIndexes() {
    try {
        console.log(`Connecting to: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection;
        const usersCollection = db.collection('users');

        const indexes = await usersCollection.indexes();
        console.log("Indexes on users collection:");
        console.dir(indexes, { depth: null });

        for (let idx of indexes) {
            if (idx.expireAfterSeconds !== undefined) {
                console.log(`Found TTL index: ${idx.name} with expireAfterSeconds: ${idx.expireAfterSeconds}. Dropping it...`);
                await usersCollection.dropIndex(idx.name);
                console.log(`Dropped TTL index: ${idx.name}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkIndexes();
