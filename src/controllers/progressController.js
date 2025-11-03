import { Enrollment, Progress } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const getProgress = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const enrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled" });
  const prog = await Progress.findOne({ user: req.user._id, course: courseId });
  res.json({ success: true, data: prog || { user: req.user._id, course: courseId, completedLessons: [] } });
});

export const toggleLesson = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { lessonKey, completed } = req.body; // lessonKey like "w1-t0-s0-c3"
  if (!lessonKey) return res.status(400).json({ message: "lessonKey required" });
  const enrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled" });

  const prog = await Progress.findOneAndUpdate(
    { user: req.user._id, course: courseId },
    { $setOnInsert: { user: req.user._id, course: courseId } },
    { new: true, upsert: true }
  );

  const exists = prog.completedLessons.includes(lessonKey);
  if (completed && !exists) prog.completedLessons.push(lessonKey);
  if (!completed && exists) prog.completedLessons = prog.completedLessons.filter((k) => k !== lessonKey);
  await prog.save();
  res.json({ success: true, data: prog });
});


