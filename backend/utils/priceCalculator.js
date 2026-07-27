const MenuItem = require('../models/MenuItem');

/**
 * Calculates the total order cost strictly on the backend to prevent frontend price manipulation.
 * @param {Array} itemsArray - Array of objects containing { menuItemId, quantity }
 * @returns {Object} - { totalCost, processedItems }
 */
const calculateOrderTotal = async (itemsArray) => {
  if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) {
    throw new Error('Order items array cannot be empty');
  }

  let totalCost = 0;
  const processedItems = [];

  for (const item of itemsArray) {
    const { menuItemId, quantity } = item;

    if (!menuItemId || quantity == null || quantity <= 0) {
      throw new Error(`Invalid item format or quantity for item ID: ${menuItemId || 'Unknown'}`);
    }

    // Query the database to get the trusted server-side price
    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
      throw new Error(`Menu item with ID ${menuItemId} not found`);
    }

    if (menuItem.stock < quantity) {
      throw new Error(`Not enough stock for '${menuItem.name}'. Requested: ${quantity}, Available: ${menuItem.stock}`);
    }

    // Calculate strict backend price
    totalCost += menuItem.price * quantity;
    
    // Store the processed data for the controller to use
    processedItems.push({
      menuItem: menuItem._id,
      quantity,
      priceAtPurchase: menuItem.price,
      document: menuItem // Pass the raw document so we can decrement stock later
    });
  }

  return { totalCost, processedItems };
};

module.exports = { calculateOrderTotal };
