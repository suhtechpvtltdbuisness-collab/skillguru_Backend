import { Certificate, Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const issueCertificate = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId })
    .populate("course");

  if (!enrollment) return res.status(404).json({ message: "Not enrolled" });

  let cert = await Certificate.findOne({ user: req.user._id, course: courseId });
  if (!cert) {
    cert = await Certificate.create({ user: req.user._id, course: courseId });
  }

  const populated = await Certificate.findById(cert._id)
    .populate({ path: "user", select: "name email" })
    .populate({ path: "course", select: "title durationHours instructor" });

  res.json({ success: true, data: populated });
});

export const verifyCertificate = catchAsync(async (req, res) => {
  const { id } = req.params; // certificateId
  const cert = await Certificate.findOne({ certificateId: id })
    .populate({ path: "user", select: "name email" })
    .populate({ path: "course", select: "title durationHours instructor" });

  if (!cert) return res.status(404).json({ valid: false });
  res.json({ success: true, valid: true, data: cert });
});

export const getMyCertificates = catchAsync(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id })
    .populate({ path: "course", select: "title thumbnailUrl instructor durationHours" })
    .sort({ issuedAt: -1 });

  res.json({ success: true, data: certificates });
});

export const downloadCertificate = catchAsync(async (req, res) => {
  const { id } = req.params; // certificate _id
  const cert = await Certificate.findOne({ _id: id, user: req.user._id })
    .populate({ path: "user", select: "name email" })
    .populate({ path: "course", select: "title durationHours instructor" });

  if (!cert) return res.status(404).json({ message: "Certificate not found" });

  // Return certificate data for PDF generation on frontend
  res.json({
    success: true,
    data: cert
  });
});

// Admin endpoints
export const getAllCertificates = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, courseId, search } = req.query;
  const query = {};

  if (courseId) {
    query.course = courseId;
  }

  if (search) {
    // Search by student name, email, or certificate ID
    const { SkillGuruUser } = await import("../models/index.js");
    const matchingUsers = await SkillGuruUser.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).select("_id");

    query.$or = [
      { certificateId: { $regex: search, $options: "i" } },
      { user: { $in: matchingUsers.map(u => u._id) } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const certificates = await Certificate.find(query)
    .populate("user", "name email")
    .populate("course", "title instructor durationHours")
    .sort({ issuedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Certificate.countDocuments(query);

  res.json({
    success: true,
    data: certificates,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});


