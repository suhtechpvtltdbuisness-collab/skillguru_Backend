import { Enrollment, Review } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const createReview = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { rating, comment, aspects } = req.body;
  if (!rating) return res.status(400).json({ message: "Rating is required" });

  const enrolled = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrolled) return res.status(403).json({ message: "Only enrolled students can review" });

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, course: courseId },
    { $set: { rating, comment, ...(aspects ? { aspects } : {}) } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: review });
});

export const getCourseReviews = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const reviews = await Review.find({ course: courseId })
    .populate({ path: "user", select: "name" })
    .sort({ createdAt: -1 });

  const agg = await Review.aggregate([
    { $match: { course: new Review.mongo.ObjectId(courseId) } },
    { $group: { _id: "$course", avg: { $avg: "$rating" }, count: { $sum: 1 },
      contentQuality: { $avg: "$aspects.contentQuality" },
      instructorClarity: { $avg: "$aspects.instructorClarity" },
      valueForMoney: { $avg: "$aspects.valueForMoney" },
    } }
  ]);

  const summary = {
    average: agg[0]?.avg || 0,
    count: agg[0]?.count || 0,
    aspects: {
      contentQuality: agg[0]?.contentQuality || 0,
      instructorClarity: agg[0]?.instructorClarity || 0,
      valueForMoney: agg[0]?.valueForMoney || 0,
    }
  };
  res.json({ success: true, data: { reviews, summary } });
});


