const express = require('express');
const router = express.Router();
const {
  updateUserRole,
  getAllOrders,
  getDailySales,
  getPopularItems,
  getAllUsers,
  getAllRoles,
  getOrderLogs,
  getRestaurantStatus,
  toggleRestaurantStatus
} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize(['Admin']))
;
router.get('/status', getRestaurantStatus);
router.patch('/status', toggleRestaurantStatus);
router.get('/stats', getDailySales);

router.get('/reports/daily', getDailySales);
router.get('/reports/items', getPopularItems);

router.get('/orders', getAllOrders);

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/roles', getAllRoles);

router.get('/logs', getOrderLogs);

module.exports = router;