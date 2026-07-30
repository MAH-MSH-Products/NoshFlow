const mongoose = require('mongoose');
const OrderLog = require('./models/OrderLog');

mongoose.connect('mongodb://127.0.0.1:27017/foodops')
  .then(async () => {
    const logs = await OrderLog.find().limit(5).lean();
    console.log(JSON.stringify(logs, null, 2));
    process.exit(0);
  });
