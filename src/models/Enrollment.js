import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  status: { type: String, enum: ["enrolled","completed","cancelled"], default: "enrolled" },
  progress: { type: Number, default: 0 }, // percentage
  enrolledAt: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
