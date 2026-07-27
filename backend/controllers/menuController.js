const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

/**
 * @desc    Fetch all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

/**
 * @desc    Fetch all menu items (with search and filters)
 * @route   GET /api/menu-items
 * @access  Public
 */
const getMenuItems = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock } = req.query;
    
    // Build the query object dynamically
    let query = {};
    
    // 1. Search by name or description (case-insensitive)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 2. Filter by Category ObjectId
    if (category) {
      query.category = category;
    }
    
    // 3. Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // 4. Filter by Stock Availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    const menuItems = await MenuItem.find(query).populate('category', 'name description');
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
};

/**
 * @desc    Fetch a single menu item by ID
 * @route   GET /api/menu-items/:id
 * @access  Public
 */
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('category', 'name description');
    
    if (menuItem) {
      res.status(200).json(menuItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    console.error('Error fetching menu item by ID:', error.message);
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    res.status(500).json({ message: 'Server error while fetching menu item' });
  }
};

module.exports = {
  getCategories,
  getMenuItems,
  getMenuItemById
};
