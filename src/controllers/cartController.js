import { Cart, Course, Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const getMyCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({ path: "items.course", select: "title price thumbnailUrl instructor" });
  res.json({ success: true, data: cart || { user: req.user._id, items: [] } });
});

export const addToCart = catchAsync(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId).select("_id price published");
  if (!course || !course.published) return res.status(404).json({ message: "Course not available" });

  // Prevent adding already enrolled course
  const alreadyEnrolled = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (alreadyEnrolled) return res.status(400).json({ message: "Already enrolled in this course" });

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true }
  );

  const exists = cart.items.some((it) => String(it.course) === String(course._id));
  if (!exists) {
    cart.items.push({ course: course._id, priceAtAdd: course.price });
    await cart.save();
  }

  const populated = await cart.populate({ path: "items.course", select: "title price thumbnailUrl instructor" });
  res.status(201).json({ success: true, data: populated });
});

export const removeFromCart = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { items: { course: courseId } } },
    { new: true }
  ).populate({ path: "items.course", select: "title price thumbnailUrl instructor" });
  res.json({ success: true, data: cart || { user: req.user._id, items: [] } });
});

export const clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { upsert: true });
  res.json({ success: true, message: "Cart cleared" });
});


