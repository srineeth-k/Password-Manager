import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';

dotenv.config();

// App
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
console.log('MongoDB connected');

const db = client.db(process.env.DB_NAME);
const collection = db.collection('passwords');

// GET all passwords
app.get('/', async (req, res) => {
  try {
    const passwords = await collection.find({}).toArray();
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a password
app.post('/', async (req, res) => {
  try {
    const password = req.body;

    // Ensure id exists (frontend sends it)
    if (!password.id) return res.status(400).json({ error: "Password must have an id" });

    const result = await collection.insertOne(password);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a password
app.delete('/', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "id is required to delete" });

    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Password not found" });
    }

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
