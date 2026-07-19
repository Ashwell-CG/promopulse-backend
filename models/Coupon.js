// Require mongoose
const mongoose = require('mongoose');

// Define the Coupon schema
const couponSchema = new mongoose.Schema({
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign', // Reference to the Campaign model
    required: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true // Coupon code must be unique
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  redeemed: { 
    type: Boolean, 
    default: false // By default, a new coupon is not redeemed
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the Coupon model
module.exports = mongoose.model('Coupon', couponSchema);
