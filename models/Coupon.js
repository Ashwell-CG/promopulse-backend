const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign',
    required: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  redeemed: { 
    type: Boolean, 
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
