import { Assignment, AssignmentSubmission, Course, Coursecontent, Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const myDashboard = catchAsync(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "course",
      select: "title thumbnailUrl instructor",
      populate: {
        path: "instructor",
        select: "name"
      }
    })
    .lean();

  const courseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

  const assignments = await Assignment.find({ course: { $in: courseIds } })
    .select("course title dueDate maxMarks")
    .sort({ dueDate: 1 })
    .limit(50)
    .lean();

  // Get submissions for these assignments
  const assignmentIds = assignments.map(a => a._id);
  const submissions = await AssignmentSubmission.find({
    assignment: { $in: assignmentIds },
    student: req.user._id
  }).select("assignment submittedAt status marks").lean();

  // Create a map of submissions by assignment ID
  const submissionMap = {};
  submissions.forEach(sub => {
    submissionMap[sub.assignment.toString()] = sub;
  });

  // Merge submission data with assignments
  const assignmentsWithSubmissions = assignments.map(assignment => ({
    ...assignment,
    submission: submissionMap[assignment._id.toString()] || null,
    submitted: !!submissionMap[assignment._id.toString()]
  }));

  res.json({ success: true, data: { enrollments, assignments: assignmentsWithSubmissions } });
});

export const myCourseDetail = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId })
    .populate({
      path: "course",
      populate: {
        path: "instructor",
        select: "name"
      }
    });
  if (!enrollment) return res.status(404).json({ message: "Not enrolled" });

  const content = await Coursecontent.findOne({ course: courseId }).lean();
  const assignments = await Assignment.find({ course: courseId }).lean();

  // Get progress data
  const Progress = (await import("../models/index.js")).Progress;
  const progress = await Progress.findOne({ user: req.user._id, course: courseId }).lean();

  res.json({ success: true, data: { enrollment, content, assignments, progress } });
});


