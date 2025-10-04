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
  metadata: { type: Object, default: {} }
}, { timestamps: true });


skillGuruUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


skillGuruUserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};


skillGuruUserSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verificationTokenExpiry = Date.now() + 1000 * 60 * 60;
  return token;
};

const SkillGuruUser = mongoose.model("SkillGuruUser", skillGuruUserSchema);
export default SkillGuruUser;
