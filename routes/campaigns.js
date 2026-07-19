// Require express and create a router
const express = require('express');
const router = express.Router();

// Require middleware and models
const isLoggedIn = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Coupon = require('../models/Coupon');

// Apply the isLoggedIn middleware to all routes in this file
router.use(isLoggedIn);

// GET /campaigns - Show all campaigns for the logged-in user
router.get('/campaigns', async (req, res) => {
  try {
    // Find all campaigns belonging to the current user
    const campaigns = await Campaign.find({ userId: req.session.userId });
    
    // Render the campaigns view
    res.render('campaigns', { campaigns: campaigns, user: req.session.userName });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).send('Something went wrong');
  }
});

// GET /campaigns/new - Show form to create a new campaign
router.get('/campaigns/new', (req, res) => {
  // Pass an empty campaign object for create mode
  res.render('campaign-form', { campaign: {}, user: req.session.userName });
});

// POST /campaigns - Handle creating a new campaign
router.post('/campaigns', async (req, res) => {
  try {
    // Combine form data with user ID from session
    const campaignData = {
      ...req.body,
      userId: req.session.userId
    };
    
    // Create the campaign in the database
    await Campaign.create(campaignData);
    
    // Redirect back to campaigns list
    res.redirect('/campaigns');
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).send('Something went wrong');
  }
});

// GET /campaigns/edit/:id - Show form to edit an existing campaign
router.get('/campaigns/edit/:id', async (req, res) => {
  try {
    // Find the campaign by ID
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).send('Campaign not found');
    }
    
    // Pass the existing campaign data to the form
    res.render('campaign-form', { campaign: campaign, user: req.session.userName });
  } catch (error) {
    console.error('Error fetching campaign for edit:', error);
    res.status(500).send('Something went wrong');
  }
});

// POST /campaigns/edit/:id - Handle updating a campaign
router.post('/campaigns/edit/:id', async (req, res) => {
  try {
    // Update the campaign with the new form data
    await Campaign.findByIdAndUpdate(req.params.id, req.body);
    
    // Redirect back to campaigns list
    res.redirect('/campaigns');
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).send('Something went wrong');
  }
});

// POST /campaigns/delete/:id - Handle deleting a campaign
router.post('/campaigns/delete/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Delete the campaign
    await Campaign.findByIdAndDelete(campaignId);
    
    // Also delete all coupons associated with this campaign
    await Coupon.deleteMany({ campaignId: campaignId });
    
    // Redirect back to campaigns list
    res.redirect('/campaigns');
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).send('Something went wrong');
  }
});

// Export the router
module.exports = router;
