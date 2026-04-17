const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Queue = require('../models/Queue');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Queue.deleteMany();
    
    // Drop legacy indices
    try {
      await User.collection.dropIndexes();
      await Queue.collection.dropIndexes();
      console.log('Dropped legacy indices.');
    } catch (e) {
      console.log('No indices to drop or already dropped.');
    }
    
    console.log('Cleared existing Users and Queues.');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'ADMIN'
    });
    console.log('Admin user created (admin@example.com / password123)');

    // Create Staff
    const staff1 = await User.create({
      name: 'Staff One',
      email: 'staff1@example.com',
      password: 'password123',
      role: 'STAFF'
    });
    const staff2 = await User.create({
      name: 'Staff Two',
      email: 'staff2@example.com',
      password: 'password123',
      role: 'STAFF'
    });
    console.log('Staff users created (staff1@example.com, staff2@example.com / password123)');

    // Create a User
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'USER'
    });
    console.log('Regular user created (john@example.com / password123)');

    // Create an initial Queue
    const queue = await Queue.create({
      name: 'General Service Queue',
      isActive: true
    });
    console.log(`Initial Queue created: ${queue.name} (ID: ${queue._id})`);

    // Assign staff1 to the queue
    staff1.queueId = queue._id;
    await staff1.save();
    console.log(`Assigned staff1 to ${queue.name}`);

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
