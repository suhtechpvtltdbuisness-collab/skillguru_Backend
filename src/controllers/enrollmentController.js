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
