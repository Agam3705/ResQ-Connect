require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const setupPassport = require('./config/passport');

const app = express();

// --- SECURITY & PERFORMANCE ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://resq-connect0.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev, restrict in prod
    }
  },
  credentials: true
}));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { message: 'Too many requests. Try again later.' }
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Passport
setupPassport();
app.use(passport.initialize());

// --- DATABASE ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// --- ROUTES ---
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/family', require('./routes/family'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/community', require('./routes/community'));
app.use('/api/social', require('./routes/social'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/missing', require('./routes/missing'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/medicine', require('./routes/medicine'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/exchange', require('./routes/exchange'));
app.use('/api/agency-chat', require('./routes/agencyChat'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/first-aid', require('./routes/firstAid'));
app.use('/api/agency-services', require('./routes/agencyServices'));

// --- ERROR HANDLER (must be last) ---
app.use(errorHandler);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});