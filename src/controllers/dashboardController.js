import { Assignment, Course, Coursecontent, Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const myDashboard = catchAsync(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({ path: "course", select: "title thumbnailUrl instructor" })
    .lean();

  const courseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

  const assignments = await Assignment.find({ course: { $in: courseIds } })
    .select("course title dueDate")
    .sort({ dueDate: 1 })
    .limit(50)
    .lean();

  res.json({ success: true, data: { enrollments, assignments } });
});

export const myCourseDetail = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId }).populate("course");
  if (!enrollment) return res.status(404).json({ message: "Not enrolled" });

  const content = await Coursecontent.findOne({ course: courseId }).lean();
  const assignments = await Assignment.find({ course: courseId }).lean();

  res.json({ success: true, data: { enrollment, content, assignments } });
});


