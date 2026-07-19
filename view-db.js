// Script to quickly view all data in MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Coupon = require('./models/Coupon');

async function viewDatabase() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/promopulse');
    console.log('Connected successfully!\n');

    // Fetch users
    console.log('=== USERS COLLECTION ===');
    const users = await User.find({}, 'name email createdAt');
    if (users.length > 0) {
      console.table(users.map(u => ({
        ID: u._id.toString(),
        Name: u.name,
        Email: u.email,
        Created: u.createdAt.toLocaleString()
      })));
    } else {
      console.log('No users found.\n');
    }

    // Fetch campaigns
    console.log('\n=== CAMPAIGNS COLLECTION ===');
    const campaigns = await Campaign.find({});
    if (campaigns.length > 0) {
      console.table(campaigns.map(c => ({
        ID: c._id.toString(),
        Name: c.name,
        'Discount %': c.discountPercentage,
        Status: c.status,
        'Start Date': c.startDate.toLocaleDateString(),
        'End Date': c.endDate.toLocaleDateString()
      })));
    } else {
      console.log('No campaigns found.\n');
    }

    // Fetch coupons
    console.log('\n=== COUPONS COLLECTION ===');
    const coupons = await Coupon.find({}).populate('campaignId', 'name');
    if (coupons.length > 0) {
      console.table(coupons.map(cp => ({
        ID: cp._id.toString(),
        Code: cp.code,
        Campaign: cp.campaignId ? cp.campaignId.name : 'N/A',
        Redeemed: cp.redeemed ? 'YES (Redeemed)' : 'NO (Active)',
        'Expiry Date': cp.expiryDate.toLocaleDateString()
      })));
    } else {
      console.log('No coupons found.\n');
    }

  } catch (err) {
    console.error('Error viewing database:', err);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
}

viewDatabase();
