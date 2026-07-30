const mongoose = require('mongoose');
const Order = require('./models/Order');
require('./models/User');
require('./models/MenuItem');

mongoose.connect('mongodb://127.0.0.1:27017/foodops')
  .then(async () => {
    // Let's just fetch the last 5 orders
    const orders = await Order.find().sort({createdAt: -1}).limit(5).lean();
    console.log(JSON.stringify(orders, null, 2));
    mongoose.connection.close();
  });
