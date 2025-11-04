import { Assignment, AssignmentSubmission, Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

// Get all assignments for a course
export const getCourseAssignments = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const assignments = await Assignment.find({ course: courseId })
    .populate({ path: "createdBy", select: "name" })
    .sort({ dueDate: 1 });

  res.json({ success: true, data: assignments });
});

// Get single assignment
export const getAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const assignment = await Assignment.findById(id)
    .populate({ path: "course", select: "title" })
    .populate({ path: "createdBy", select: "name" });

  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  res.json({ success: true, data: assignment });
});

// Create assignment (Teacher/Admin only)
export const createAssignment = catchAsync(async (req, res) => {
  const { course, title, description, dueDate, maxMarks, attachments } = req.body;

  const assignment = await Assignment.create({
    course,
    title,
    description,
    dueDate,
    maxMarks,
    attachments,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: assignment });
});

// Update assignment (Teacher/Admin only)
export const updateAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, maxMarks, attachments } = req.body;

  const assignment = await Assignment.findByIdAndUpdate(
    id,
    { title, description, dueDate, maxMarks, attachments },
    { new: true, runValidators: true }
  );

  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  res.json({ success: true, data: assignment });
});

// Delete assignment (Admin only)
export const deleteAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const assignment = await Assignment.findByIdAndDelete(id);

  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  res.json({ success: true, message: "Assignment deleted" });
});

// Submit assignment (Student)
export const submitAssignment = catchAsync(async (req, res) => {
  const { id } = req.params; // assignment id
  const { content, attachments } = req.body;

  const assignment = await Assignment.findById(id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  // Check if student is enrolled
  const enrolled = await Enrollment.findOne({
    student: req.user._id,
    course: assignment.course
  });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled in this course" });

  // Check if late
  const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);

  const submission = await AssignmentSubmission.findOneAndUpdate(
    { assignment: id, student: req.user._id },
    {
      assignment: id,
      student: req.user._id,
      course: assignment.course,
      content,
      attachments,
      submittedAt: new Date(),
      status: isLate ? "late" : "submitted"
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: submission });
});

// Get my submissions
export const getMySubmissions = catchAsync(async (req, res) => {
  const { courseId } = req.query;

  const filter = { student: req.user._id };
  if (courseId) filter.course = courseId;

  const submissions = await AssignmentSubmission.find(filter)
    .populate({ path: "assignment", select: "title dueDate maxMarks" })
    .populate({ path: "course", select: "title" })
    .sort({ submittedAt: -1 });

  res.json({ success: true, data: submissions });
});

// Get submission for specific assignment
export const getSubmission = catchAsync(async (req, res) => {
  const { id } = req.params; // assignment id

  const submission = await AssignmentSubmission.findOne({
    assignment: id,
    student: req.user._id
  })
    .populate({ path: "assignment", select: "title dueDate maxMarks" })
    .populate({ path: "course", select: "title" });

  res.json({ success: true, data: submission });
});

// Grade assignment (Teacher/Admin only)
export const gradeAssignment = catchAsync(async (req, res) => {
  const { submissionId } = req.params;
  const { marks, feedback } = req.body;

  const submission = await AssignmentSubmission.findByIdAndUpdate(
    submissionId,
    { marks, feedback, status: "graded" },
    { new: true }
  ).populate({ path: "student", select: "name email" });

  if (!submission) return res.status(404).json({ message: "Submission not found" });

  res.json({ success: true, data: submission });
});

// Get all submissions for an assignment (Teacher/Admin only)
export const getAssignmentSubmissions = catchAsync(async (req, res) => {
  const { id } = req.params; // assignment id

  const submissions = await AssignmentSubmission.find({ assignment: id })
    .populate({ path: "student", select: "name email" })
    .sort({ submittedAt: -1 });

  res.json({ success: true, data: submissions });
});
