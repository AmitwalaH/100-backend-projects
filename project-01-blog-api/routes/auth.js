const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send('User already exists!');
    }
    
    // Create new user
    const newUser = new User({ username, password });
    await newUser.save();
    
    res.send('User registered successfully!');
  } catch (error) {
    res.send('Registration failed: ' + error.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.send('Invalid username or password!');
    }
    
    req.session.username = username;
    // Redirect to dashboard instead of just sending message
    res.redirect('/dashboard.html');
  } catch (error) {
    res.send('Login failed: ' + error.message);
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.send('Logged out successfully!');
});

module.exports = router;