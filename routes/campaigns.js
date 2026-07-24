const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Coupon = require('../models/Coupon');

router.use(isLoggedIn);

router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.session.userId });
    res.render('campaigns', { campaigns: campaigns, user: req.session.userName });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).send('Something went wrong');
  }
});

router.get('/campaigns/new', (req, res) => {
  res.render('campaign-form', { campaign: {}, user: req.session.userName });
});

router.post('/campaigns', async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      userId: req.session.userId
    };
    
    await Campaign.create(campaignData);
    res.redirect('/campaigns');
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).send('Something went wrong');
  }
});

router.get('/campaigns/edit/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).send('Campaign not found');
    }
    
    res.render('campaign-form', { campaign: campaign, user: req.session.userName });
  } catch (error) {
    console.error('Error fetching campaign for edit:', error);
    res.status(500).send('Something went wrong');
  }
});

router.post('/campaigns/edit/:id', async (req, res) => {
  try {
    await Campaign.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/campaigns');
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).send('Something went wrong');
  }
});

router.post('/campaigns/delete/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    await Campaign.findByIdAndDelete(campaignId);
    
    // Cascading delete: remove all coupons associated with this campaign
    await Coupon.deleteMany({ campaignId: campaignId });
    
    res.redirect('/campaigns');
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
