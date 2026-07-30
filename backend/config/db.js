const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * Uses the MONGO_URI environment variable.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Log success message with the host to confirm connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error message if the connection fails
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit the process with failure code (1) to prevent the app from running without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
