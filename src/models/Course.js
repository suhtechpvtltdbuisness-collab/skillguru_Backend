import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  shortDescription: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
  category: { type: String },
  price: { type: Number, default: 0 },
  durationHours: { type: Number },
  level: { type: String, enum: ["beginner","intermediate","advanced"], default: "beginner" },
  tags: [String],
  thumbnailUrl: String,
  published: { type: Boolean, default: false },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
export default Course;
