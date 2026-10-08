import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/retain-app';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding');

    // Create default "Uncategorized" category if it doesn't exist
    const defaultCategory = await Category.findOne({ name: 'Uncategorized' });
    if (!defaultCategory) {
      await Category.create({
        name: 'Uncategorized',
        description: 'Default category for uncategorized expenses',
      });
      console.log('Created default "Uncategorized" category');
    } else {
      console.log('Default "Uncategorized" category already exists');
    }

    // Create some default categories
    const defaultCategories = [
      { name: 'Food & Dining', description: 'Restaurants, groceries, snacks' },
      { name: 'Transportation', description: 'Gas, public transport, rideshare' },
      { name: 'Entertainment', description: 'Movies, games, subscriptions' },
      { name: 'Shopping', description: 'Clothing, electronics, household items' },
      { name: 'Bills & Utilities', description: 'Electricity, water, internet' },
      { name: 'Healthcare', description: 'Medications, doctor visits' },
      { name: 'Education', description: 'Books, courses, tuition' },
      { name: 'Personal Care', description: 'Haircuts, cosmetics, gym' },
    ];

    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`Created category: ${categoryData.name}`);
      }
    }

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@retain.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Created admin user');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();