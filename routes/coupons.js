// Require express and create a router
const express = require('express');
const router = express.Router();

// Require middleware and models
const isLoggedIn = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const Campaign = require('../models/Campaign');

// Apply the isLoggedIn middleware to all routes in this file
router.use(isLoggedIn);

// Helper function to generate a random coupon code
function generateCouponCode() {
    const prefixes = ['SAVE', 'PROMO', 'DEAL', 'DISC', 'OFFER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    return prefix + number;
}

// GET /coupons - Show all coupons and provide validation message if any
router.get('/coupons', async (req, res) => {
  try {
    // Find all campaigns for the logged-in user
    const userCampaigns = await Campaign.find({ userId: req.session.userId });
    
    // Get an array of just the campaign IDs
    const campaignIds = userCampaigns.map(c => c._id);
    
    // Find all coupons belonging to those campaigns and populate campaign data
    const coupons = await Coupon.find({ campaignId: { $in: campaignIds } })
                                .populate('campaignId');
    
    // Get query parameters for messages (e.g., from validation)
    const { message, type } = req.query;
    
    // Render the coupons view
    res.render('coupons', { 
      coupons: coupons, 
      campaigns: userCampaigns, 
      user: req.session.userName,
      message: message || null,
      type: type || null
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).send('Something went wrong');
  }
});

// POST /coupons/generate/:campaignId - Generate a new coupon for a specific campaign
router.post('/coupons/generate/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    
    // Find the campaign to get its expiry date
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).send('Campaign not found');
    }
    
    // Create the new coupon
    await Coupon.create({
      campaignId: campaignId,
      code: generateCouponCode(),
      expiryDate: campaign.endDate // Use campaign's end date as coupon expiry
    });
    
    // Redirect back to coupons list
    res.redirect('/coupons');
  } catch (error) {
    console.error('Error generating coupon:', error);
    res.status(500).send('Something went wrong');
  }
});

// POST /coupons/validate - Validate and redeem a coupon code
router.post('/coupons/validate', async (req, res) => {
  try {
    const rawCode = req.body.code;
    
    if (!rawCode) {
      return res.redirect('/coupons?message=Please provide a coupon code&type=danger');
    }
    
    // Convert input to uppercase for case-insensitive matching
    const code = rawCode.toUpperCase();
    
    // Find the coupon in the database
    const coupon = await Coupon.findOne({ code: code });
    
    // Check 1: Does the coupon exist?
    if (!coupon) {
      return res.redirect('/coupons?message=Coupon not found&type=danger');
    }
    
    // Check 2: Is the coupon expired?
    if (coupon.expiryDate < new Date()) {
      return res.redirect('/coupons?message=Coupon has expired&type=danger');
    }
    
    // Check 3: Has the coupon already been used?
    if (coupon.redeemed) {
      return res.redirect('/coupons?message=Coupon already used&type=danger');
    }
    
    // Otherwise, mark it as redeemed
    coupon.redeemed = true;
    await coupon.save();
    
    // Redirect with success message
    res.redirect('/coupons?message=Coupon redeemed successfully!&type=success');
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).send('Something went wrong');
  }
});

// Export the router
module.exports = router;
