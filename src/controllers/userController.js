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


