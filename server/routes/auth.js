const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, agencyDetails } = req.body;

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'civilian',
      agencyDetails: role === 'agency' ? agencyDetails : undefined,
      civilianDetails: role === 'civilian' ? { familyCircleId: null } : undefined
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // 2. Check Agency Status
    if (user.role === 'agency' && user.agencyDetails?.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Your agency account is pending Admin approval.' 
      });
    }

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // 4. Create Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      'secretKey', 
      { expiresIn: '1d' }
    );

    // 5. Send Response (With _id for Family Circle)
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyDetails: user.agencyDetails,
        civilianDetails: user.civilianDetails
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-password', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare plain text password with hashed DB password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;