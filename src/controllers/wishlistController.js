import { Course, Wishlist } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const getMyWishlist = catchAsync(async (req, res) => {
  const wl = await Wishlist.findOne({ user: req.user._id }).populate({ path: "items.course", select: "title price thumbnailUrl instructor" });
  res.json({ success: true, data: wl || { user: req.user._id, items: [] } });
});

export const addToWishlist = catchAsync(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId).select("_id");
  if (!course) return res.status(404).json({ message: "Course not found" });

  const wl = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true }
  );

  const exists = wl.items.some((it) => String(it.course) === String(course._id));
  if (!exists) {
    wl.items.push({ course: course._id });
    await wl.save();
  }

  const populated = await wl.populate({ path: "items.course", select: "title price thumbnailUrl instructor" });
  res.status(201).json({ success: true, data: populated });
});

export const removeFromWishlist = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const wl = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { items: { course: courseId } } },
    { new: true }
  ).populate({ path: "items.course", select: "title price thumbnailUrl instructor" });
  res.json({ success: true, data: wl || { user: req.user._id, items: [] } });
});


