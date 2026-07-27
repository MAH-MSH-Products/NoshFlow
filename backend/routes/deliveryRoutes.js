const express = require('express');
const router = express.Router();
const { getDeliveryOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get all orders ready for delivery
router.get('/orders', protect, authorize(['Admin', 'Cashier']), getDeliveryOrders);

module.exports = router;
