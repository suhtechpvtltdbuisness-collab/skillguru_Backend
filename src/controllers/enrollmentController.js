import { Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const enroll = catchAsync(async (req, res) => {
  const { courseId } = req.body;
  const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (existing) return res.status(400).json({ message: "Already enrolled" });
  const enrollment = await Enrollment.create({ student: req.user._id, course: courseId });
  res.status(201).json({ success: true, data: enrollment });
});

export const myEnrollments = catchAsync(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate("course");
  res.json({ success: true, data: enrollments });
});

export const getEnrollmentStats = async (req, res) => {
  try {
    const stats = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseData"
        }
      },
      { $unwind: "$courseData" },
      {
        $group: {
          _id: "$course",
          courseName: { $first: "$courseData.title" },
          totalStudents: { $sum: 1 },
          avgProgress: { $avg: "$progress" },
          enrolled: {
            $sum: { $cond: [{ $eq: ["$status", "enrolled"] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          courseName: 1,
          totalStudents: 1,
          avgProgress: { $round: ["$avgProgress", 2] },
          enrolled: 1,
          completed: 1,
          cancelled: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error in getEnrollmentStats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Admin endpoints
export const getAllEnrollments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, courseId, search } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (courseId) {
    query.course = courseId;
  }

  if (search) {
    // Search by student name or email
    const { SkillGuruUser } = await import("../models/index.js");
    const matchingUsers = await SkillGuruUser.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).select("_id");

    query.student = { $in: matchingUsers.map(u => u._id) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const enrollments = await Enrollment.find(query)
    .populate("student", "name email phone")
    .populate("course", "title thumbnailUrl instructor durationHours")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Enrollment.countDocuments(query);

  res.json({
    success: true,
    data: enrollments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getEnrollmentById = catchAsync(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate("student", "name email phone")
    .populate("course", "title price thumbnailUrl instructor durationHours");

  if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

  res.json({ success: true, data: enrollment });
});

export const updateEnrollmentStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  if (!["enrolled", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

  enrollment.status = status;
  await enrollment.save();

  res.json({ success: true, data: enrollment });
});
