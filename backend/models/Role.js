const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Customer', 'Kitchen Staff', 'Cashier', 'Admin'],
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
