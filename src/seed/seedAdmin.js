import dotenv from "dotenv";
import mongoose from "mongoose";
import SkillGuruUser from "../models/SkillGuruUser.js";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://Ankit:Ankit@cluster0.m609d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await SkillGuruUser.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      // Delete existing admin to reseed
      await SkillGuruUser.deleteOne({ email: "admin@gmail.com" });
      console.log("Deleted existing admin for fresh seed");
    }

    // Create new admin - DON'T hash password manually!
    const admin = new SkillGuruUser({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: "Admin@123", // Plain password - let the pre-save hook handle hashing
      role: "admin",
      phone: "+91-9876543210", // Optional
      bio: "System Administrator", // Optional
      isVerified: true,
    });

    await admin.save();
    console.log("✅ Admin user seeded successfully");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: Admin@123");
    process.exit();
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedAdmin();
};

run();
