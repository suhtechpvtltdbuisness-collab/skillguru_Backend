import jwt from "jsonwebtoken";
import { SkillGuruUser } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const exists = await SkillGuruUser.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });
  const user = await SkillGuruUser.create({ name, email, password, role, phone });
  res.status(201).json({ success: true, token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await SkillGuruUser.findOne({ email });
  if (!user) return res.status(401).json({ message: "Please Regitser First" });
  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ success: true, token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
