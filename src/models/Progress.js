import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: [String], default: [] }, // e.g., week-topic-subtopic-class indices
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;


