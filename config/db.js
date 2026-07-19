// Require mongoose for MongoDB interaction
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to database using URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to database:', error);
    // Exit process with failure code
    process.exit(1);
  }
};

// Export the function to use in app.js
module.exports = connectDB;
