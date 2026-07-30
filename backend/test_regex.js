const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/foodops')
  .then(async () => {
    const partialId = "8a768a";
    
    // We want to match `customer` or `_id`? 
    // In getOrderLogs it's `order_id`. In getAllOrders it's `customer`.
    const orders = await Order.find({
      $expr: {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: partialId,
          options: "i"
        }
      }
    }).limit(2);
    
    console.log("Orders found:", orders.length);
    process.exit(0);
  });
