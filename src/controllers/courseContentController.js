import { Coursecontent } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";


export const createCourseContent = catchAsync(async (req, res) => {
  const content = await Coursecontent.create(req.body);
  res.status(201).json({ success: true, data: content });
});


export const getCourseContent = catchAsync(async (req, res) => {
  const content = await Coursecontent.findOne({ course: req.params.courseId }).populate("course");
  if (!content) return res.status(404).json({ success: false, message: "Content not found" });
  res.json({ success: true, data: content });
});


export const updateCourseContent = catchAsync(async (req, res) => {
  const content = await Coursecontent.findOneAndUpdate(
    { course: req.params.courseId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!content) return res.status(404).json({ success: false, message: "Content not found" });
  res.json({ success: true, data: content });
});


export const deleteCourseContent = catchAsync(async (req, res) => {
  const content = await Coursecontent.findOneAndDelete({ course: req.params.courseId });
  if (!content) return res.status(404).json({ success: false, message: "Content not found" });
  res.json({ success: true, message: "Content deleted successfully" });
});
