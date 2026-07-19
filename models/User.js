// Require mongoose
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Email must be unique for each user
  },
  password: { 
    type: String, 
    required: true 
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
