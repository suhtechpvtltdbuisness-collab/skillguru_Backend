import crypto from "crypto";
import jwt from "jsonwebtoken";
import { SkillGuruUser } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const exists = await SkillGuruUser.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });

  const user = await SkillGuruUser.create({ name, email, password, role, phone });


  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${user.email}`;


  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `<p>Hi ${user.name},</p>
           <p>Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">Verify Email</a>
           <p>This link will expire in 1 hour.</p>`
  });

  res.status(201).json({
    success: true,
    message: "Registration successful! Please check your email to verify your account."
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await SkillGuruUser.findOne({ email });
  console.log(user)
  if (!user) return res.status(401).json({ message: "Please register first" });

  if (!user.isVerified) {
    return res.status(401).json({ message: "Account not verified. Please check your email." });
  }

  console.log( password , "password")

  const match = await user.comparePassword(password);

  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    success: true,
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});


export const verifyEmail = catchAsync(async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) return res.status(400).json({ message: "Invalid verification link" });

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await SkillGuruUser.findOne({
    email,
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully!" });
});

export const getAllEmployees = catchAsync(async (req, res) => {
  const employees = await SkillGuruUser.find({
    role: { $in: ["teacher", "sales", "admin"] }
  }).select("-password -verificationToken -verificationTokenExpiry"); // exclude sensitive fields

  res.status(200).json({
    success: true,
    count: employees.length,
    employees
  });
});

const generateRandomPassword = (length = 10) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};


export const addEmployee = catchAsync(async (req, res) => {
  const { name, email, role, phone } = req.body;


  if (!["student", "teacher", "sales"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'student', 'teacher', or 'sales'" });
  }


  const exists = await SkillGuruUser.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });


  const password = generateRandomPassword(10);


  const employee = await SkillGuruUser.create({
    name,
    email,
    password,
    role,
    phone,
    isVerified: true,  // directly verified
  });

  // Send email with credentials
  await sendEmail({
    to: employee.email,
    subject: "Your Account Credentials",
    html: `<p>Hi ${employee.name},</p>
           <p>Your account has been created with SkillGuru.</p>
           <p><strong>Email:</strong> ${employee.email}</p>
           <p><strong>Password:</strong> ${password}</p>
           <p>You can now login directly using these credentials.</p>`
  });

  res.status(201).json({
    success: true,
    message: "Employee created successfully and credentials sent via email",
    employeeId: employee._id
  });
});

