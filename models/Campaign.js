const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  discountPercentage: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'],
    default: 'Active' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
