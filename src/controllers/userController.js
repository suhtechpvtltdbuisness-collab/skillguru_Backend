import { SkillGuruUser } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

const sanitizeString = (value) => (typeof value === "string" ? value.trim() : value);

const serializeUser = (userDoc) => {
  const user = userDoc.toObject({ versionKey: false });
  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpiry;
  delete user.passwordResetToken;
  delete user.passwordResetExpiry;
  return user;
};

export const getProfile = catchAsync(async (req, res) => {
  const user = await SkillGuruUser.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(serializeUser(user));
});

export const updateProfile = catchAsync(async (req, res) => {
  const user = await SkillGuruUser.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const {
    firstName,
    lastName,
    phone,
    bio,
    avatarUrl,
    address,
    dob,
    location,
    postalCode,
    gender,
    metadata
  } = req.body;

  if (gender && !["Male", "Female", "Other", "Prefer not to say"].includes(gender)) {
    return res.status(400).json({ message: "Invalid gender selected" });
  }

  const updates = {
    firstName,
    lastName,
    phone,
    bio,
    avatarUrl,
    address,
    location,
    postalCode,
    gender
  };

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      user[key] = sanitizeString(value);
    }
  });

  if (dob !== undefined) {
    if (!dob) {
      user.dob = undefined;
    } else {
      const parsedDob = new Date(dob);
      if (Number.isNaN(parsedDob.getTime())) {
        return res.status(400).json({ message: "Invalid date of birth" });
      }
      user.dob = parsedDob;
    }
  }

  if (metadata !== undefined) {
    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      user.metadata = { ...(user.metadata || {}), ...metadata };
    } else {
      return res.status(400).json({ message: "Metadata must be an object" });
    }
  }

  if (firstName !== undefined || lastName !== undefined) {
    const combinedName = [firstName ?? user.firstName, lastName ?? user.lastName]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(" ");

    if (combinedName) {
      user.name = combinedName;
    }
  }

  await user.save();

  res.json(serializeUser(user));
});

// Admin endpoints
export const getAllStudents = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, verified } = req.query;
  const query = { role: { $ne: "admin" } }; // Exclude admins

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  if (verified !== undefined) {
    query.verified = verified === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const students = await SkillGuruUser.find(query)
    .select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetExpiry")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SkillGuruUser.countDocuments(query);

  res.json({
    success: true,
    data: students,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getStudentById = catchAsync(async (req, res) => {
  const student = await SkillGuruUser.findById(req.params.id)
    .select("-password -verificationToken -verificationTokenExpiry -passwordResetToken -passwordResetExpiry");

  if (!student) return res.status(404).json({ message: "Student not found" });

  res.json({ success: true, data: student });
});


