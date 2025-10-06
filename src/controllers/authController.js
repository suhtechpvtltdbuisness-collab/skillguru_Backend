import crypto from "crypto";
import jwt from "jsonwebtoken";
import { SkillGuruUser } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });


export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  // Check if user already exists
  const exists = await SkillGuruUser.findOne({ email });
  if (exists) {
    if (exists.isVerified) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    } else {
      return res.status(400).json({
        message: "Email already registered but not verified. Please check your email or request a new verification link.",
        needsVerification: true
      });
    }
  }

  // Generate verification token
  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");
  const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  // Create user with verification token
  const user = await SkillGuruUser.create({
    name,
    email,
    password,
    role: role || "student",
    phone,
    verificationToken: hashedToken,
    verificationTokenExpiry: tokenExpiry
  });

  console.log(`✓ User registered: ${user.email}`);

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${plainToken}&email=${encodeURIComponent(user.email)}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your SkillGuru account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SkillGuru, ${user.name}! 🎉</h2>
          <p>Thank you for registering. Please verify your email address to activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't create this account, please ignore this email.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
        </div>
      `
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    // Don't fail registration if email fails
  }

  res.status(201).json({
    success: true,
    message: "Registration successful! Please check your email to verify your account."
  });
});

// ==========================================
// VERIFY EMAIL
// ==========================================
export const verifyEmail = catchAsync(async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification link. Token and email are required."
    });
  }

  const decodedEmail = decodeURIComponent(email);
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  console.log(`Attempting to verify email: ${decodedEmail}`);

  // Find user with matching token and unexpired expiry
  const user = await SkillGuruUser.findOne({
    email: decodedEmail,
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    // Check if user exists to provide better error message
    const userCheck = await SkillGuruUser.findOne({ email: decodedEmail });

    if (!userCheck) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    if (userCheck.isVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: "Email already verified! You can log in now."
      });
    }

    // Token is invalid or expired
    return res.status(400).json({
      success: false,
      message: "Verification link is invalid or has expired. Please request a new one.",
      needsResend: true
    });
  }

  // Mark as verified and clear token
  user.isVerified = true;
  user.clearVerificationToken();
  await user.save();

  console.log(`✓ Email verified successfully: ${decodedEmail}`);

  res.status(200).json({
    success: true,
    message: "Email verified successfully! You can now log in."
  });
});


export const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await SkillGuruUser.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found. Please register first." });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Email is already verified. Please login." });
  }

  // Generate new verification token
  const plainToken = user.generateVerificationToken();
  await user.save();

  console.log(`✓ Resending verification email to: ${user.email}`);

  // Send new verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${plainToken}&email=${encodeURIComponent(user.email)}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your SkillGuru account - New Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email, ${user.name}</h2>
          <p>You requested a new verification link. Click the button below to verify your account:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent! Please check your inbox."
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email. Please try again later."
    });
  }
});

// ==========================================
// LOGIN USER
// ==========================================
export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user
  const user = await SkillGuruUser.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Check if verified
  if (!user.isVerified) {
    return res.status(401).json({
      message: "Account not verified. Please check your email for the verification link.",
      needsVerification: true
    });
  }


  const match = await user.comparePassword(password);

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  console.log(`✓ User logged in: ${user.email}`);

  res.json({
    success: true,
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl
    }
  });
});


export const getCurrentUser = catchAsync(async (req, res) => {

  const user = await SkillGuruUser.findById(req.user.id).select("-password -verificationToken -verificationTokenExpiry");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    success: true,
    user
  });
});

// ==========================================
// LOGOUT USER (Optional - mainly for client-side)
// ==========================================
export const logoutUser = catchAsync(async (req, res) => {

  console.log(`✓ User logged out: ${req.user?.id}`);

  res.json({
    success: true,
    message: "Logged out successfully"
  });
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

