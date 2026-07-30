const mongoose = require('mongoose');
const Order = require('./models/Order');
require('./models/User');
require('./models/MenuItem');

mongoose.connect('mongodb://127.0.0.1:27017/foodops')
  .then(async () => {
    const orders = await Order.find().populate('customer', 'name email').populate('items.menuItem', 'name price').limit(1);
    console.log(JSON.stringify(orders, null, 2));
    mongoose.connection.close();
  });
