const express = require('express');
const router = express.Router();
const { getCategories, getMenuItems, getMenuItemById } = require('../controllers/menuController');

// Map endpoints (Mounted at /api in server.js)
router.get('/categories', getCategories);
router.get('/menu-items', getMenuItems);
router.get('/menu-items/:id', getMenuItemById);

module.exports = router;
