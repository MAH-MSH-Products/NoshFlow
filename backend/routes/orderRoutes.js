const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder,
  getKitchenOrders,
  startOrder,
  readyOrder,
  getDeliveryOrders,
  deliverOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { checkWorkingHours } = require('../middlewares/workingHoursMiddleware');

// Define specific Role-Based Access Controls
const customerAuth = [protect, authorize(['Customer'])];
const kitchenAuth = [protect, authorize(['Admin', 'Kitchen Staff'])];
const deliveryAuth = [protect, authorize(['Admin', 'Cashier'])];

// ==========================================
// STATIC ROUTES (MUST come before /:id routes)
// ==========================================

// Staff GET Routes
router.get('/kitchen', kitchenAuth, getKitchenOrders);
router.get('/delivery', deliveryAuth, getDeliveryOrders);

// Customer GET / POST Routes
router.post('/', customerAuth, checkWorkingHours, createOrder);
router.get('/me', customerAuth, getMyOrders);

// ==========================================
// PARAMETERIZED ROUTES (/:id)
// ==========================================

// Customer specific actions
router.get('/:id', customerAuth, getOrderById);
router.patch('/:id/cancel', customerAuth, cancelOrder);

// Kitchen specific actions
router.patch('/:id/start', kitchenAuth, startOrder);
router.patch('/:id/ready', kitchenAuth, readyOrder);

// Cashier specific actions
router.patch('/:id/deliver', deliveryAuth, deliverOrder);

module.exports = router;
