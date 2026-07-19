// Require express and create a router
const express = require('express');
const router = express.Router();

// Require bcrypt for password hashing
const bcrypt = require('bcryptjs');

// Require the User model
const User = require('../models/User');

// GET route to show registration form
router.get('/register', (req, res) => {
  res.render('register', { user: req.session.userName, error: null });
});

// POST route to handle registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { user: req.session.userName, error: 'Email already exists' });
    }

    // Hash the password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Redirect to login page after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Something went wrong during registration');
  }
});

// GET route to show login form
router.get('/login', (req, res) => {
  res.render('login', { user: req.session.userName, error: null });
});

// POST route to handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Compare provided password with hashed password in database
    if (user && await bcrypt.compare(password, user.password)) {
      // Store user ID and name in session
      req.session.userId = user._id;
      req.session.userName = user.name;
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } else {
      // Show error if login fails
      res.render('login', { user: req.session.userName, error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Something went wrong during login');
  }
});

// GET route to handle logout
router.get('/logout', (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    // Redirect to login page
    res.redirect('/login');
  });
});

// Export the router
module.exports = router;
