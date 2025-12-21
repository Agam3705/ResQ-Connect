require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');
const adminRoutes = require('./routes/admin'); // Admin Panel Routes
const userRoutes = require('./routes/user'); // Notifications & Profile
const missingRoutes = require('./routes/missing'); // Missing Persons
const chatRoutes = require('./routes/chat'); // Community Chat

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173", // Local Frontend
    "https://your-vercel-app.vercel.app" // REPLACE THIS with your actual Vercel URL
  ],
  credentials: true
}));

// --- DATABASE CONNECTION ---
// This line now uses the Key you set in Render
const mongoURI = process.env.MONGO_URI; 

if (!mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected via Render URI'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/missing', missingRoutes);
app.use('/api/chat', chatRoutes);

// --- HEALTH CHECK (For Render) ---
app.get('/', (req, res) => {
  res.send('ResQ-Connect Server is Running!');
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
