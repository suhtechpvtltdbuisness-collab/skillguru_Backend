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
