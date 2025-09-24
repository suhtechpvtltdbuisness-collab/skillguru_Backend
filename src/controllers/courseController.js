import { Course } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const createCourse = catchAsync(async (req, res) => {
  const payload = { ...req.body, instructor: req.user._id };
  const course = await Course.create(payload);
  res.status(201).json({ success: true, data: course });
});

export const listCourses = catchAsync(async (req, res) => {
  const courses = await Course.find().populate("instructor", "name email");
  res.json({ success: true, data: courses });
});

export const getCourse = catchAsync(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("instructor", "name email");
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json({ success: true, data: course });
});
