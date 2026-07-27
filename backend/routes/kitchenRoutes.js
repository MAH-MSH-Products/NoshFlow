const express = require('express');
const router = express.Router();
const { getKitchenOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get all orders for the kitchen
router.get('/orders', protect, authorize(['Admin', 'Kitchen Staff']), getKitchenOrders);

module.exports = router;
