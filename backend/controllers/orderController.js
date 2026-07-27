const Order = require('../models/Order');
const OrderLog = require('../models/OrderLog');
const MenuItem = require('../models/MenuItem');
const Discount = require('../models/Discount');
const { calculateOrderTotal } = require('../utils/priceCalculator');

/**
 * @desc    Submit a new order
 * @route   POST /api/orders
 * @access  Private/Customer
 */
const createOrder = async (req, res) => {
  try {
    const { items, discountCode } = req.body || {};

    // 1. Calculate price and validate stock entirely on the backend
    // This utilizes our robust calculateOrderTotal utility.
    const { totalCost, processedItems } = await calculateOrderTotal(items);
    
    let finalTotalCost = totalCost;
    let appliedDiscount = null;

    // 2. Validate and apply Discount if provided
    if (discountCode) {
      const discount = await Discount.findOne({ code: discountCode.toUpperCase(), isActive: true });
      
      if (!discount) {
        return res.status(400).json({ message: 'Invalid or inactive discount code' });
      }
      if (new Date() > discount.expiresAt) {
        return res.status(400).json({ message: 'Discount code has expired' });
      }
      if (discount.usedCount >= discount.maxUses) {
        return res.status(400).json({ message: 'Discount code usage limit reached' });
      }

      // Calculate final total
      finalTotalCost = totalCost - (totalCost * (discount.discountPercentage / 100));
      if (finalTotalCost < 0) finalTotalCost = 0; // Prevent negative totals
      
      appliedDiscount = discount;
    }

    // 3. Map items strictly to the Order schema format
    const orderItems = processedItems.map(item => ({
      menuItem: item.menuItem,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase
    }));

    // 4. Create the order with default "Registered" status
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalPrice: finalTotalCost,
      status: 'Registered'
    });

    // 4. Atomically decrement inventory and prevent Race Conditions
    const successfulDecrements = [];
    try {
      for (const item of processedItems) {
        // Atomic find & update: Only decrements if the stock is STILL >= quantity
        const updatedItem = await MenuItem.findOneAndUpdate(
          { _id: item.menuItem, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedItem) {
          throw new Error(`Race condition caught: '${item.document.name}' went out of stock just before order completion.`);
        }
        successfulDecrements.push(item);
      }
    } catch (stockError) {
      // Rollback: Revert any items that were successfully decremented before the failure
      for (const successfulItem of successfulDecrements) {
        await MenuItem.findByIdAndUpdate(successfulItem.menuItem, {
          $inc: { stock: successfulItem.quantity }
        });
      }
      
      // Delete the lingering order that was just created
      await Order.findByIdAndDelete(order._id);
      
      return res.status(409).json({ message: stockError.message });
    }

    // 6. Atomically update discount usage to prevent race conditions on the discount limit
    if (appliedDiscount) {
      const updatedDiscount = await Discount.findOneAndUpdate(
        { _id: appliedDiscount._id, usedCount: { $lt: appliedDiscount.maxUses } },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      // If the limit was reached exactly at checkout by concurrent users
      if (!updatedDiscount) {
        // Rollback stock decrements
        for (const successfulItem of successfulDecrements) {
          await MenuItem.findByIdAndUpdate(successfulItem.menuItem, {
            $inc: { stock: successfulItem.quantity }
          });
        }
        // Delete the order
        await Order.findByIdAndDelete(order._id);
        
        return res.status(409).json({ message: 'Discount code usage limit reached due to concurrent orders. Order cancelled.' });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error.message);
    
    // Catch validation errors thrown from our price calculator (stock/not found issues)
    if (error.message.includes('stock') || error.message.includes('not found') || error.message.includes('empty') || error.message.includes('Invalid item')) {
      return res.status(400).json({ message: error.message });
    }

    
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

/**
 * @desc    Fetch all orders for the currently authenticated user
 * @route   GET /api/orders/me
 * @access  Private/Customer
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.menuItem', 'name image price')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

/**
 * @desc    Fetch a specific order's details
 * @route   GET /api/orders/:id
 * @access  Private/Customer
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: Ensure the order actually belongs to the requesting user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID format' });
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

/**
 * @desc    Cancel an order
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private/Customer
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: Ensure the order belongs to the requesting user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Business Logic Constraint: Can only cancel if 'Registered'
    if (order.status !== 'Registered') {
      return res.status(400).json({ 
        message: `Order cannot be cancelled because it has progressed to status: '${order.status}'` 
      });
    }

    // Update status to Cancelled
    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    // Revert stock (give items back to inventory)
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stock: item.quantity } // Increment stock by the quantity returned
      });
    }

    res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error cancelling order:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID format' });
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
};

// --- STAFF APIs (Phase 5) ---

/**
 * @desc    Fetch all orders for Kitchen
 * @route   GET /api/orders/kitchen
 * @access  Private/Kitchen
 */
const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['Registered', 'Preparing'] } })
      .populate('items.menuItem', 'name image price')
      .sort({ createdAt: 1 }); // Oldest first
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching kitchen orders' });
  }
};

/**
 * @desc    Change status to Preparing
 * @route   PATCH /api/orders/:id/start
 * @access  Private/Kitchen
 */
const startOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Registered') {
      return res.status(400).json({ message: `Strict Constraint: Cannot start order from status '${order.status}'. Must be 'Registered'.` });
    }

    // Calculate estimated prep time (5 mins per quantity unit)
    let totalItems = 0;
    order.items.forEach(item => totalItems += item.quantity);
    order.estimatedPrepTime = totalItems * 5;

    // Update state
    order.status = 'Preparing';
    const updatedOrder = await order.save();

    // Audit Log
    await OrderLog.create({
      order_id: order._id,
      old_status: 'Registered',
      new_status: 'Preparing',
      changed_by: req.user._id
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error starting order:', error.message);
    res.status(500).json({ message: 'Server error while starting order' });
  }
};

/**
 * @desc    Change status to Ready for Delivery
 * @route   PATCH /api/orders/:id/ready
 * @access  Private/Kitchen
 */
const readyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Preparing') {
      return res.status(400).json({ message: `Strict Constraint: Cannot mark ready from status '${order.status}'. Must be 'Preparing'.` });
    }

    // Update state
    order.status = 'Ready for Delivery';
    const updatedOrder = await order.save();

    // Audit Log
    await OrderLog.create({
      order_id: order._id,
      old_status: 'Preparing',
      new_status: 'Ready for Delivery',
      changed_by: req.user._id
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error marking order ready:', error.message);
    res.status(500).json({ message: 'Server error while marking order ready' });
  }
};

/**
 * @desc    Fetch all orders for Delivery
 * @route   GET /api/orders/delivery
 * @access  Private/Cashier
 */
const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'Ready for Delivery' })
      .populate('items.menuItem', 'name price')
      .populate('customer', 'name email')
      .sort({ createdAt: 1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching delivery orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching delivery orders' });
  }
};

/**
 * @desc    Change status to Delivered
 * @route   PATCH /api/orders/:id/deliver
 * @access  Private/Cashier
 */
const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Ready for Delivery') {
      return res.status(400).json({ message: `Strict Constraint: Cannot deliver from status '${order.status}'. Must be 'Ready for Delivery'.` });
    }

    // Update state
    order.status = 'Delivered';
    const updatedOrder = await order.save();

    // Audit Log
    await OrderLog.create({
      order_id: order._id,
      old_status: 'Ready for Delivery',
      new_status: 'Delivered',
      changed_by: req.user._id
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error delivering order:', error.message);
    res.status(500).json({ message: 'Server error while delivering order' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getKitchenOrders,
  startOrder,
  readyOrder,
  getDeliveryOrders,
  deliverOrder
};
