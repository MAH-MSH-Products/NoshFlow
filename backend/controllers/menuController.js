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

// --- ADMIN CATEGORY APIS ---

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

/**
 * @desc    Update a category
 * @route   PATCH /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid category ID' });
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Strict Data Integrity: Check if any MenuItems are referencing this category
    const linkedItemsCount = await MenuItem.countDocuments({ category: categoryId });
    
    if (linkedItemsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category because it is referenced by ${linkedItemsCount} menu item(s). Please reassign or delete them first.` 
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid category ID' });
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

// --- ADMIN MENU ITEM APIS ---

/**
 * @desc    Create a new menu item
 * @route   POST /api/menu-items
 * @access  Private/Admin
 */
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body || {};

    // Handle physical file upload if present, otherwise fallback to URL string from body
    let finalImage = image || '';
    if (req.file) {
      finalImage = `/uploads/${req.file.filename}`;
    }

    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(404).json({ message: 'Specified category does not exist' });

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      stock: stock || 0,
      image: finalImage,
      category
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid category or menu item ID provided' });
    res.status(500).json({ message: 'Server error while creating menu item' });
  }
};

/**
 * @desc    Update a menu item
 * @route   PATCH /api/menu-items/:id
 * @access  Private/Admin
 */
const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body || {};
    
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return res.status(404).json({ message: 'Specified category does not exist' });
      menuItem.category = category;
    }

    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    
    // Handle image update (physical file priority over string URL)
    if (req.file) {
      menuItem.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      menuItem.image = image;
    }

    const updatedMenuItem = await menuItem.save();
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    console.error('Error updating menu item:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID provided' });
    res.status(500).json({ message: 'Server error while updating menu item' });
  }
};

/**
 * @desc    Update menu item stock specifically
 * @route   PATCH /api/menu-items/:id/availability
 * @access  Private/Admin
 */
const updateMenuItemStock = async (req, res) => {
  try {
    const { stock } = req.body || {};
    
    if (stock === undefined || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Please provide a valid numeric stock value (0 or greater)' });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    menuItem.stock = stock;
    const updatedMenuItem = await menuItem.save();
    
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    console.error('Error updating stock:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid menu item ID' });
    res.status(500).json({ message: 'Server error while updating stock' });
  }
};

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/menu-items/:id
 * @access  Private/Admin
 */
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid menu item ID' });
    res.status(500).json({ message: 'Server error while deleting menu item' });
  }
};

module.exports = {
  getCategories,
  getMenuItems,
  getMenuItemById,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  updateMenuItemStock,
  deleteMenuItem
};
