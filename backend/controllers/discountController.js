const Discount = require('../models/Discount');
const { calculateOrderTotal } = require('../utils/priceCalculator');

/**
 * @desc    Create a new discount code
 * @route   POST /api/discounts
 * @access  Private/Admin
 */
const createDiscount = async (req, res) => {
  try {
    const { code, discountPercentage, maxUses, expiresAt } = req.body || {};
    
    if (!code || !discountPercentage || !maxUses || !expiresAt) {
      return res.status(400).json({ message: 'Code, percentage, maxUses, and expiration date are required' });
    }
    
    const discount = await Discount.create({ code, discountPercentage, maxUses, expiresAt });
    res.status(201).json(discount);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Discount code already exists' });
    console.error('Error creating discount:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all discount codes
 * @route   GET /api/discounts
 * @access  Private/Admin
 */
const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.status(200).json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a discount code
 * @route   PATCH /api/discounts/:id
 * @access  Private/Admin
 */
const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.status(200).json(discount);
  } catch (error) {
    console.error('Error updating discount:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid discount ID format' });
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a discount code
 * @route   DELETE /api/discounts/:id
 * @access  Private/Admin
 */
const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.status(200).json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid discount ID format' });
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Validate a discount code and optionally calculate the cart total
 * @route   POST /api/discounts/validate
 * @access  Private/Customer
 */
const validateDiscount = async (req, res) => {
  try {
    const { code, items } = req.body || {};
    
    if (!code) {
      return res.status(400).json({ message: 'Discount code is required' });
    }
    
    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!discount) {
      return res.status(400).json({ message: 'Invalid or inactive discount code' });
    }
    if (new Date() > discount.expiresAt) {
      return res.status(400).json({ message: 'Discount code has expired' });
    }
    if (discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ message: 'Discount code usage limit reached' });
    }

    let originalTotal = 0;
    let discountedTotal = 0;

    // If frontend sends the current cart items, calculate the exact new totals
    if (items && Array.isArray(items) && items.length > 0) {
      try {
        const { totalCost } = await calculateOrderTotal(items);
        originalTotal = totalCost;
        discountedTotal = totalCost - (totalCost * (discount.discountPercentage / 100));
        if (discountedTotal < 0) discountedTotal = 0;
      } catch (calcError) {
        // Fallback: If cart has errors (e.g. out of stock), we still want to inform them the code is technically valid
        // But we return the error to let them know the cart itself needs fixing
        return res.status(400).json({ message: calcError.message });
      }
    }

    res.status(200).json({
      valid: true,
      code: discount.code,
      discountPercentage: discount.discountPercentage,
      originalTotal,
      discountedTotal
    });

  } catch (error) {
    console.error('Error validating discount:', error.message);
    res.status(500).json({ message: 'Server error while validating discount' });
  }
};

module.exports = { createDiscount, getDiscounts, updateDiscount, deleteDiscount, validateDiscount };
