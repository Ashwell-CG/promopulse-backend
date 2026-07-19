// Load environment variables from .env file
require('dotenv').config();

// Require external modules
const express = require('express');
const path = require('path');
const session = require('express-session');

// Require database configuration
const connectDB = require('./config/db');

// Require Models
const Campaign = require('./models/Campaign');
const Coupon = require('./models/Coupon');

// Require Middleware
const isLoggedIn = require('./middleware/auth');

// Require Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const couponRoutes = require('./routes/coupons');

// Connect to database
connectDB();

// Create express app
const app = express();

// Configure view engine to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (form data)

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret', // Secret key for signing the session ID cookie
  resave: false, // Don't save session if unmodified
  saveUninitialized: false // Don't create session until something stored
}));

// Routes

// Home route
app.get('/', (req, res) => {
  res.render('home', { user: req.session.userName });
});

// Dashboard route (protected by isLoggedIn middleware)
app.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Find all campaigns for the current user
    const userCampaigns = await Campaign.find({ userId: userId });
    
    // Get array of campaign IDs
    const campaignIds = userCampaigns.map(c => c._id);
    
    // Find all coupons associated with the user's campaigns
    const userCoupons = await Coupon.find({ campaignId: { $in: campaignIds } });
    
    // Calculate statistics
    const totalCampaigns = userCampaigns.length;
    const totalCoupons = userCoupons.length;
    
    // Count redeemed coupons
    const redeemedCoupons = userCoupons.filter(coupon => coupon.redeemed).length;
    
    // Calculate redemption rate
    const redemptionRate = totalCoupons > 0 ? ((redeemedCoupons / totalCoupons) * 100).toFixed(2) : 0;
    
    // Find recent campaigns (last 5, sorted by creation date descending)
    const recentCampaigns = await Campaign.find({ userId: userId })
                                          .sort({ createdAt: -1 })
                                          .limit(5);
                                          
    // Render dashboard view with data
    res.render('dashboard', {
      totalCampaigns,
      totalCoupons,
      redeemedCoupons,
      redemptionRate,
      recentCampaigns,
      user: req.session.userName
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Something went wrong');
  }
});

// Analytics route (protected by isLoggedIn middleware)
app.get('/analytics', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Find all campaigns for the current user
    const userCampaigns = await Campaign.find({ userId: userId });
    const campaignIds = userCampaigns.map(c => c._id);
    
    // Find all coupons associated with the user's campaigns
    const userCoupons = await Coupon.find({ campaignId: { $in: campaignIds } });
    
    // Calculate statistics
    const totalCampaigns = userCampaigns.length;
    const totalCoupons = userCoupons.length;
    const redeemedCoupons = userCoupons.filter(coupon => coupon.redeemed).length;
    const remainingCoupons = totalCoupons - redeemedCoupons;
    const redemptionRate = totalCoupons > 0 ? ((redeemedCoupons / totalCoupons) * 100).toFixed(2) : 0;
    
    // Render analytics view with data
    res.render('analytics', {
      totalCampaigns,
      totalCoupons,
      redeemedCoupons,
      remainingCoupons,
      redemptionRate,
      user: req.session.userName
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).send('Something went wrong');
  }
});

// Use router files for specific path handling
app.use('/', authRoutes);
app.use('/', campaignRoutes);
app.use('/', couponRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
