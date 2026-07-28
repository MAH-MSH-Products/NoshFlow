const express = require('express');
const router = express.Router();
const { 
  updateUserRole, 
  getAllOrders, 
  getDailySales, 
  getPopularItems 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Strictly restrict ALL routes in this file to 'Admin'
router.use(protect, authorize(['Admin']));

// Analytics / Reports
router.get('/reports/daily', getDailySales);
router.get('/reports/items', getPopularItems);

// Order Management
router.get('/orders', getAllOrders);

// User Management
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
