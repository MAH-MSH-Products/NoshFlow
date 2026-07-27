const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { checkWorkingHours } = require('../middlewares/workingHoursMiddleware');

// Ensure that ALL order routes require authentication AND the 'Customer' role
router.use(protect, authorize(['Customer']));

router.post('/', checkWorkingHours, createOrder);
router.get('/me', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
