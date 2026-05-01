const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { asyncHandler } = require('../utils/helpers');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// GOOGLE OAUTH REDIRECT ROUTES
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed` }), (req, res) => {
  if (!req.user.isActive) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=account_deactivated`);
  }
  const token = generateToken(req.user);
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?token=${token}`);
});

// REGISTER
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role, agencyDetails } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({
    name, email,
    password: hashedPassword,
    role: role || 'civilian',
    agencyDetails: role === 'agency' ? agencyDetails : undefined,
    civilianDetails: role === 'civilian' ? { joinedFamilies: [] } : undefined
  });

  await user.save();
  res.status(201).json({ message: 'User registered successfully' });
}));

// LOGIN
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  if (user.isActive === false) {
    return res.status(403).json({ message: 'Account has been deactivated. Contact admin.' });
  }

  if (user.role === 'agency' && user.agencyDetails && user.agencyDetails.status && user.agencyDetails.status !== 'approved') {
    return res.status(403).json({ message: `Your agency account is ${user.agencyDetails.status}. Contact admin.` });
  }

  // Google-only accounts can't use password login
  if (user.authProvider === 'google' && user.password === 'google-oauth-no-password') {
    return res.status(400).json({ message: 'Please use Google Sign-In for this account.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = generateToken(user);

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      agencyDetails: user.agencyDetails,
      civilianDetails: user.civilianDetails,
      phone: user.phone,
      address: user.address
    }
  });
}));

// GOOGLE AUTH - Initiate
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// GOOGLE AUTH - Callback
router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
}), (req, res) => {
  const token = generateToken(req.user);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/login?token=${token}`);
});

// GOOGLE TOKEN VERIFY (for client-side Google Sign-In)
router.post('/google/token', asyncHandler(async (req, res) => {
  const { credential, clientId } = req.body;
  
  // Decode the Google JWT credential
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;
  
  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }
  } else {
    user = new User({
      name, email, googleId,
      avatar: picture,
      authProvider: 'google',
      password: 'google-oauth-no-password',
      role: 'civilian',
      isActive: true
    });
    await user.save();
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account deactivated.' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar,
      agencyDetails: user.agencyDetails,
      civilianDetails: user.civilianDetails
    }
  });
}));

// VERIFY PASSWORD (for document vault)
router.post('/verify-password', asyncHandler(async (req, res) => {
  const { userId, password } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect Password' });

  res.json({ success: true });
}));

module.exports = router;