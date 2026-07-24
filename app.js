require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');

const Campaign = require('./models/Campaign');
const Coupon = require('./models/Coupon');

const isLoggedIn = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const couponRoutes = require('./routes/coupons');

connectDB();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configure secure sessions for user state management
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.render('home', { user: req.session.userName });
});

// Protected dashboard route aggregating campaign and coupon metrics
app.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const userCampaigns = await Campaign.find({ userId: userId });
    const campaignIds = userCampaigns.map(c => c._id);
    const userCoupons = await Coupon.find({ campaignId: { $in: campaignIds } });
    
    const totalCampaigns = userCampaigns.length;
    const totalCoupons = userCoupons.length;
    
    const redeemedCoupons = userCoupons.filter(coupon => coupon.redeemed).length;
    const redemptionRate = totalCoupons > 0 ? ((redeemedCoupons / totalCoupons) * 100).toFixed(2) : 0;
    
    const recentCampaigns = await Campaign.find({ userId: userId })
                                          .sort({ createdAt: -1 })
                                          .limit(5);
                                          
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

// Protected analytics route providing detailed coupon breakdown
app.get('/analytics', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const userCampaigns = await Campaign.find({ userId: userId });
    const campaignIds = userCampaigns.map(c => c._id);
    const userCoupons = await Coupon.find({ campaignId: { $in: campaignIds } });
    
    const totalCampaigns = userCampaigns.length;
    const totalCoupons = userCoupons.length;
    const redeemedCoupons = userCoupons.filter(coupon => coupon.redeemed).length;
    const remainingCoupons = totalCoupons - redeemedCoupons;
    const redemptionRate = totalCoupons > 0 ? ((redeemedCoupons / totalCoupons) * 100).toFixed(2) : 0;
    
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

app.use('/', authRoutes);
app.use('/', campaignRoutes);
app.use('/', couponRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
