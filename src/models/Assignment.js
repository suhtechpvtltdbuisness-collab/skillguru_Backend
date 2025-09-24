import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  maxMarks: { type: Number },
  attachments: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser" }
}, { timestamps: true });

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
