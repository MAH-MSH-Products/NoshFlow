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
const adminAuth = [protect, authorize(['Admin'])];

// Category Admin APIs
router.post('/categories', adminAuth, createCategory);
router.patch('/categories/:id', adminAuth, updateCategory);
router.delete('/categories/:id', adminAuth, deleteCategory);

// Menu Item Admin APIs
router.post('/menu-items', adminAuth, upload.single('image'), createMenuItem);
router.patch('/menu-items/:id', adminAuth, upload.single('image'), updateMenuItem);
router.patch('/menu-items/:id/availability', adminAuth, updateMenuItemStock);
router.delete('/menu-items/:id', adminAuth, deleteMenuItem);

module.exports = router;
