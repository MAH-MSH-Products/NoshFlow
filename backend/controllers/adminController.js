const User = require('../models/User');
const Role = require('../models/Role');
const Order = require('../models/Order');
const OrderLog = require('../models/OrderLog');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('role');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { roleId } = req.body || {};
    if (!roleId) return res.status(400).json({ message: 'Role ID is required' });

    const role = await Role.findById(roleId);
    if (!role) return res.status(400).json({ message: 'Invalid role ID' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = roleId;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully', user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Error updating user role:', error.message);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ message: 'Server error while fetching roles' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, startDate, endDate, userId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (userId) query.customer = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    // Map 'customer' to 'user' for frontend compatibility
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.user = orderObj.customer;
      return orderObj;
    });

    res.status(200).json({
      orders: formattedOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit) || 1,
      totalOrders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

const getDailySales = async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'Delivered' });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrders = completedOrders.length;

    const chartDataMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartDataMap[dateStr] = 0;
    }

    completedOrders.forEach(order => {
      if (order.createdAt) {
        const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
        if (chartDataMap[orderDateStr] !== undefined) {
          chartDataMap[orderDateStr] += (order.totalPrice || 0);
        }
      }
    });

    const chartData = Object.keys(chartDataMap).map(date => ({
      date,
      revenue: chartDataMap[date]
    }));

    res.status(200).json({
      totalRevenue,
      totalOrders,
      chartData
    });
  } catch (error) {
    console.error('Error fetching daily sales:', error.message);
    res.status(500).json({ message: 'Server error while fetching daily sales' });
  }
};

const getPopularItems = async (req, res) => {
  try {
    res.status(200).json({ message: "Popular items endpoint ready." });
  } catch (error) {
    console.error('Error fetching popular items:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrderLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { orderId, startDate, endDate } = req.query;
    let query = {};

    if (orderId) query.order_id = orderId;
    if (startDate || endDate) {
      query.changed_at = {};
      if (startDate) query.changed_at.$gte = new Date(startDate);
      if (endDate) query.changed_at.$lte = new Date(endDate);
    }

    const logs = await OrderLog.find(query)
        .populate('order_id', 'status totalPrice estimatedPrepTime')
        .populate('changed_by', 'name email')
        .sort({ changed_at: -1 })
        .skip(skip)
        .limit(limit);

    const totalLogs = await OrderLog.countDocuments(query);

    res.status(200).json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit) || 1,
      totalLogs
    });
  } catch (error) {
    console.error('Error fetching order logs:', error.message);
    res.status(500).json({ message: 'Server error while fetching logs' });
  }
};
const Setting = require('../models/Setting');

const getRestaurantStatus = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'isForceOpen' });
    if (!setting) {
      setting = await Setting.create({ key: 'isForceOpen', value: false });
    }
    res.status(200).json({ isForceOpen: setting.value });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching restaurant status' });
  }
};

const toggleRestaurantStatus = async (req, res) => {
  try {
    const { isForceOpen } = req.body;
    let setting = await Setting.findOne({ key: 'isForceOpen' });
    if (!setting) {
      setting = new Setting({ key: 'isForceOpen', value: isForceOpen });
    } else {
      setting.value = isForceOpen;
    }
    await setting.save();
    res.status(200).json({ message: 'Restaurant status updated successfully', isForceOpen: setting.value });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating status' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getAllRoles,
  getAllOrders,
  getDailySales,
  getPopularItems,
  getOrderLogs,
  getRestaurantStatus,
  toggleRestaurantStatus
};
