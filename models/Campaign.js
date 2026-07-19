// Require mongoose
const mongoose = require('mongoose');

// Define the Campaign schema
const campaignSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the User model
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
    enum: ['Active', 'Inactive'], // Only allow these two values
    default: 'Active' 
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the Campaign model
module.exports = mongoose.model('Campaign', campaignSchema);
