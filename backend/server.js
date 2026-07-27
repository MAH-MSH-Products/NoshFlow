// Load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const discountRoutes = require('./routes/discountRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

// Initialize the Express application
const app = express();

// Establish the database connection
connectDB();

// --- Middlewares ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());

// Parse incoming JSON requests and put the parsed data in req.body
app.use(express.json());

// Parse incoming URL-encoded form data (extended: true allows for nested objects)
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/delivery', deliveryRoutes);

// A basic health check route to verify the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'FoodOps API is running' });
});

// --- Server Startup ---
// Define the port (default to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// Start listening for incoming connections
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
