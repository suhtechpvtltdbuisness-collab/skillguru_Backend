import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const skillGuruUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "sales", "admin"], default: "student" },
  phone: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  metadata: { type: Object, default: {} } // flexible for future fields
}, { timestamps: true });

skillGuruUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

skillGuruUserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const SkillGuruUser = mongoose.model("SkillGuruUser", skillGuruUserSchema);
export default SkillGuruUser;
