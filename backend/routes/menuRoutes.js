const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/menuController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Map endpoints (Mounted at /api in server.js)

// --- Public Routes ---
router.get('/categories', getCategories);
router.get('/menu-items', getMenuItems);
router.get('/menu-items/:id', getMenuItemById);

// --- Admin Protected Routes ---
// Apply auth and RBAC middleware to all routes below
router.use(protect, authorize(['Admin']));

// Category Admin APIs
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Menu Item Admin APIs
router.post('/menu-items', upload.single('image'), createMenuItem);
router.patch('/menu-items/:id', upload.single('image'), updateMenuItem);
router.patch('/menu-items/:id/availability', updateMenuItemStock);
router.delete('/menu-items/:id', deleteMenuItem);

module.exports = router;
