const express = require('express');
const router = express.Router();
const { 
  createDiscount, 
  getDiscounts, 
  updateDiscount, 
  deleteDiscount,
  validateDiscount
} = require('../controllers/discountController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Customer route: validate a code before checkout (Must be placed BEFORE Admin router.use)
router.post('/validate', protect, authorize(['Customer']), validateDiscount);

// Apply protection and RBAC (restricted to 'Admin') to ALL admin routes below
router.use(protect, authorize(['Admin']));

router.route('/')
  .post(createDiscount)
  .get(getDiscounts);

router.route('/:id')
  .patch(updateDiscount)
  .delete(deleteDiscount);

module.exports = router;
