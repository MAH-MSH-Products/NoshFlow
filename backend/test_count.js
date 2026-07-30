const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/foodops')
  .then(async () => {
    const partialId = "8a768a";
    
    const query = {
      $expr: {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: partialId,
          options: "i"
        }
      }
    };
    
    const count = await Order.countDocuments(query);
    console.log("Count found:", count);
    process.exit(0);
  });
