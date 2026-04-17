/**
 * Database Seed Script
 * Creates sample data for testing the Queue Management System
 *
 * Usage: node testing/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("../models/User");
const Service = require("../models/Service");
const Branch = require("../models/Branch");
const Category = require("../models/Category");

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/queue_management";

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "ADMIN",
  },
  {
    name: "Staff User",
    email: "staff@test.com",
    password: "password123",
    role: "STAFF",
  },
  {
    name: "Test Customer",
    email: "customer@test.com",
    password: "password123",
    role: "CUSTOMER",
  },
];

const services = [
  {
    name: "Banking Services",
    description:
      "All banking related services like deposits, withdrawals, loans",
  },
  {
    name: "Government Services",
    description: "Passport, Aadhaar, driving license and other govt services",
  },
];

const branchesData = [
  // Banking branches
  {
    name: "Main Branch - Jaipur",
    address: "MI Road, Jaipur, Rajasthan 302001",
    serviceName: "Banking Services",
  },
  {
    name: "City Branch - Delhi",
    address: "Connaught Place, New Delhi 110001",
    serviceName: "Banking Services",
  },
  // Government branches
  {
    name: "Passport Office - Jaipur",
    address: "JLN Marg, Jaipur, Rajasthan 302004",
    serviceName: "Government Services",
  },
  {
    name: "Passport Office - Mumbai",
    address: "Worli, Mumbai, Maharashtra 400018",
    serviceName: "Government Services",
  },
];

const categoriesData = [
  // Banking categories
  { name: "Cash Deposit", branchName: "Main Branch - Jaipur" },
  { name: "Cash Withdrawal", branchName: "Main Branch - Jaipur" },
  { name: "Account Opening", branchName: "Main Branch - Jaipur" },
  { name: "Cash Deposit", branchName: "City Branch - Delhi" },
  { name: "Cash Withdrawal", branchName: "City Branch - Delhi" },
  { name: "Loan Enquiry", branchName: "City Branch - Delhi" },
  // Government categories
  { name: "Fresh Passport", branchName: "Passport Office - Jaipur" },
  { name: "Passport Renewal", branchName: "Passport Office - Jaipur" },
  { name: "Tatkal Service", branchName: "Passport Office - Jaipur" },
  { name: "Fresh Passport", branchName: "Passport Office - Mumbai" },
  { name: "Passport Renewal", branchName: "Passport Office - Mumbai" },
  { name: "Document Verification", branchName: "Passport Office - Mumbai" },
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Service.deleteMany({});
    await Branch.deleteMany({});
    await Category.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Create users
    console.log("👤 Creating users...");
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await User.create({
        ...user,
        password: hashedPassword,
      });
      createdUsers.push(newUser);
      console.log(`   ✓ Created ${user.role}: ${user.email}`);
    }
    console.log("");

    // Create services
    console.log("🏢 Creating services...");
    const createdServices = {};
    for (const service of services) {
      const newService = await Service.create(service);
      createdServices[service.name] = newService;
      console.log(`   ✓ Created service: ${service.name}`);
    }
    console.log("");

    // Create branches
    console.log("🏬 Creating branches...");
    const createdBranches = {};
    for (const branch of branchesData) {
      const service = createdServices[branch.serviceName];
      const newBranch = await Branch.create({
        name: branch.name,
        address: branch.address,
        service: service._id,
      });
      createdBranches[branch.name] = newBranch;
      console.log(`   ✓ Created branch: ${branch.name}`);
    }
    console.log("");

    // Create categories
    console.log("📁 Creating categories...");
    for (const category of categoriesData) {
      const branch = createdBranches[category.branchName];
      // Get the service from the branch
      const service = branch.service;
      await Category.create({
        name: category.name,
        branch: branch._id,
        service: service,
      });
      console.log(
        `   ✓ Created category: ${category.name} @ ${category.branchName}`,
      );
    }
    console.log("");

    // Print summary
    console.log("═══════════════════════════════════════════════");
    console.log("✅ DATABASE SEEDED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════\n");

    console.log("📊 Summary:");
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Services: ${services.length}`);
    console.log(`   • Branches: ${branchesData.length}`);
    console.log(`   • Categories: ${categoriesData.length}`);
    console.log("");

    console.log("🔐 Test Credentials:");
    console.log("┌─────────────┬─────────────────────┬──────────────┐");
    console.log("│ Role        │ Email               │ Password     │");
    console.log("├─────────────┼─────────────────────┼──────────────┤");
    console.log("│ ADMIN       │ admin@test.com      │ password123  │");
    console.log("│ STAFF       │ staff@test.com      │ password123  │");
    console.log("│ CUSTOMER    │ customer@test.com   │ password123  │");
    console.log("└─────────────┴─────────────────────┴──────────────┘");
    console.log("");

    // Get sample IDs for testing
    const sampleService = Object.values(createdServices)[0];
    const sampleBranch = Object.values(createdBranches)[0];
    const sampleCategory = await Category.findOne({ branch: sampleBranch._id });

    console.log("🆔 Sample IDs for Testing:");
    console.log(`   • serviceId:  ${sampleService._id}`);
    console.log(`   • branchId:   ${sampleBranch._id}`);
    console.log(`   • categoryId: ${sampleCategory._id}`);
    console.log("");

    console.log("🚀 Ready to test! Run: npm start");
    console.log("");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run seed
seedDatabase();
