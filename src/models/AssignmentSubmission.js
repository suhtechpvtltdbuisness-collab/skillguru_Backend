import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  submittedAt: { type: Date, default: Date.now },
  content: { type: String },
  attachments: [String],
  marks: { type: Number },
  feedback: { type: String },
  status: { type: String, enum: ["submitted", "graded", "late"], default: "submitted" }
}, { timestamps: true });

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
export default AssignmentSubmission;
