const User = require('../models/User');
const Role = require('../models/Role');
const Order = require('../models/Order');

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { roleId } = req.body || {};
    if (!roleId) return res.status(400).json({ message: 'Role ID is required' });

    // Validate role exists
    const role = await Role.findById(roleId);
    if (!role) return res.status(400).json({ message: 'Invalid role ID' });

    // Update user
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

/**
 * @desc    Get all orders (paginated)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

/**
 * @desc    Get daily sales statistics
 * @route   GET /api/admin/reports/daily
 * @access  Private/Admin
 */
const getDailySales = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date ascending
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ];

    const dailySales = await Order.aggregate(pipeline);
    res.status(200).json(dailySales);
  } catch (error) {
    console.error('Error generating daily sales:', error.message);
    res.status(500).json({ message: 'Server error while generating daily sales' });
  }
};

/**
 * @desc    Get top 10 most popular menu items
 * @route   GET /api/admin/reports/items
 * @access  Private/Admin
 */
const getPopularItems = async (req, res) => {
  try {
    const pipeline = [
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.menuItem",
          totalQuantitySold: { $sum: "$items.quantity" }
        }
      },
      {
        $sort: { totalQuantitySold: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: "menuitems", // Assuming Mongoose pluralizes MenuItem to menuitems
          localField: "_id",
          foreignField: "_id",
          as: "itemDetails"
        }
      },
      {
        $unwind: "$itemDetails"
      },
      {
        $project: {
          _id: 0,
          menuItemId: "$_id",
          name: "$itemDetails.name",
          totalQuantitySold: 1
        }
      }
    ];

    const popularItems = await Order.aggregate(pipeline);
    res.status(200).json(popularItems);
  } catch (error) {
    console.error('Error generating popular items report:', error.message);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

module.exports = {
  updateUserRole,
  getAllOrders,
  getDailySales,
  getPopularItems
};
