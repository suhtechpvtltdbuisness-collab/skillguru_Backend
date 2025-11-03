import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    aspects: {
      contentQuality: { type: Number, min: 1, max: 5, default: 0 },
      instructorClarity: { type: Number, min: 1, max: 5, default: 0 },
      valueForMoney: { type: Number, min: 1, max: 5, default: 0 },
    }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, course: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;


