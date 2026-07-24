const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('register', { user: req.session.userName, error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { user: req.session.userName, error: 'Email already exists' });
    }

    // Hash the password with 10 salt rounds before saving to database
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Something went wrong during registration');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { user: req.session.userName, error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Compare provided password with hashed password in database
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      req.session.userName = user.name;
      res.redirect('/dashboard');
    } else {
      res.render('login', { user: req.session.userName, error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Something went wrong during login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
