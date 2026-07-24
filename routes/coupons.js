const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const Campaign = require('../models/Campaign');

router.use(isLoggedIn);

function generateCouponCode() {
    const prefixes = ['SAVE', 'PROMO', 'DEAL', 'DISC', 'OFFER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    return prefix + number;
}

router.get('/coupons', async (req, res) => {
  try {
    const userCampaigns = await Campaign.find({ userId: req.session.userId });
    const campaignIds = userCampaigns.map(c => c._id);
    
    const coupons = await Coupon.find({ campaignId: { $in: campaignIds } })
                                .populate('campaignId');
    
    const { message, type } = req.query;
    
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

router.post('/coupons/generate/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).send('Campaign not found');
    }
    
    await Coupon.create({
      campaignId: campaignId,
      code: generateCouponCode(),
      expiryDate: campaign.endDate // Coupon expires when campaign ends
    });
    
    res.redirect('/coupons');
  } catch (error) {
    console.error('Error generating coupon:', error);
    res.status(500).send('Something went wrong');
  }
});

router.post('/coupons/validate', async (req, res) => {
  try {
    const rawCode = req.body.code;
    
    if (!rawCode) {
      return res.redirect('/coupons?message=Please provide a coupon code&type=danger');
    }
    
    const code = rawCode.toUpperCase();
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
    
    // Passed all validation checks, lock the coupon
    coupon.redeemed = true;
    await coupon.save();
    
    res.redirect('/coupons?message=Coupon redeemed successfully!&type=success');
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
