const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Role = require('../models/Role');

const seedRoles = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding.');

    const roles = ['Customer', 'Kitchen Staff', 'Cashier', 'Admin'];

    for (const roleName of roles) {
      const existingRole = await Role.findOne({ name: roleName });
      if (!existingRole) {
        await Role.create({ name: roleName });
        console.log(`✅ Role '${roleName}' created successfully.`);
      } else {
        console.log(`ℹ️  Role '${roleName}' already exists.`);
      }
    }

    console.log('🎉 Role seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding roles: ${error.message}`);
    process.exit(1);
  }
};

seedRoles();
