const mongoose = require('mongoose');

const orderLogSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  old_status: {
    type: String,
    required: true
  },
  new_status: {
    type: String,
    required: true
  },
  changed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changed_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OrderLog', orderLogSchema);
