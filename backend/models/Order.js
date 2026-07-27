const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtPurchase: {
    type: Number,
    required: true
  }
}, { _id: false }); // Prevents mongoose from creating an _id for every subdocument in the array

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Registered', 'In Preparation', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Registered'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
