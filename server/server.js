const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');
const familyRoutes = require('./routes/family');
const documentRoutes = require('./routes/documents');

const app = express();

app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// PASTE YOUR ATLAS STRING HERE
const MONGO_URI = "mongodb+srv://admin:Admin123@resq-connect.ubdxcy0.mongodb.net/resq_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/family', familyRoutes);
app.use('/uploads', express.static('uploads')); 
app.use('/api/documents', documentRoutes);
app.use('/api/documents', require('./routes/documents'));
app.use('/api/community', require('./routes/community'));
app.use('/api/social', require('./routes/social'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/missing', require('./routes/missing'));
app.use('/api/user', require('./routes/user')); 
app.use('/api/admin', require('./routes/admin'));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});