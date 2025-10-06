import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";

const skillGuruUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "sales", "admin"], default: "student" },
  phone: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpiry: { type: Date },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

// Index for faster queries
skillGuruUserSchema.index({ email: 1, verificationToken: 1 });

// Pre-save hook - ONLY hash password if modified and not already hashed
skillGuruUserSchema.pre("save", async function (next) {
  // Only hash password if it's been modified and not already hashed
  if (this.isModified("password") && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
skillGuruUserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate verification token method
skillGuruUserSchema.methods.generateVerificationToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto.createHash("sha256").update(plainToken).digest("hex");
  this.verificationTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  return plainToken; // Return plain token to send in email
};

// Generate password reset token method
skillGuruUserSchema.methods.generatePasswordResetToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(plainToken).digest("hex");
  this.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  return plainToken;
};

// Clear verification token
skillGuruUserSchema.methods.clearVerificationToken = function () {
  this.verificationToken = undefined;
  this.verificationTokenExpiry = undefined;
};

// Clear password reset token
skillGuruUserSchema.methods.clearPasswordResetToken = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpiry = undefined;
};

const SkillGuruUser = mongoose.model("SkillGuruUser", skillGuruUserSchema);
export default SkillGuruUser;
