import Coupon from "../models/Coupon.js";
import { Cart } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

function isActive(c) {
  const now = new Date();
  if (!c.active) return false;
  if (c.validFrom && c.validFrom > now) return false;
  if (c.validTo && c.validTo < now) return false;
  return true;
}

export const applyCoupon = catchAsync(async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Coupon code required" });
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !isActive(coupon)) return res.status(400).json({ message: "Invalid or expired coupon" });

  const cart = await Cart.findOne({ user: req.user._id }).populate({ path: "items.course", select: "_id price" });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

  let applicableItems = cart.items;
  if (coupon.courses && coupon.courses.length > 0) {
    applicableItems = cart.items.filter((it) => coupon.courses.some((cid) => String(cid) === String(it.course._id)));
    if (applicableItems.length === 0) return res.status(400).json({ message: "Coupon does not apply to selected courses" });
  }

  const subtotal = cart.items.reduce((s, it) => s + (it.priceAtAdd || it.course.price || 0), 0);
  const discountBase = applicableItems.reduce((s, it) => s + (it.priceAtAdd || it.course.price || 0), 0);
  const discount = Math.round((discountBase * coupon.discountPercent) / 100);
  const total = Math.max(subtotal - discount, 0);

  res.json({ success: true, data: { subtotal, discount, total, code: coupon.code, percent: coupon.discountPercent } });
});

// Admin endpoints
export const getAllCoupons = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, active } = req.query;
  const query = {};

  if (search) {
    query.code = { $regex: search, $options: "i" };
  }

  if (active !== undefined) {
    query.active = active === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const coupons = await Coupon.find(query)
    .populate("courses", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Coupon.countDocuments(query);

  res.json({
    success: true,
    data: coupons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getCouponById = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).populate("courses", "title price");
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  res.json({ success: true, data: coupon });
});

export const createCoupon = catchAsync(async (req, res) => {
  const { code, discountPercent, active, validFrom, validTo, courses } = req.body;

  if (!code || !discountPercent) {
    return res.status(400).json({ message: "Code and discount percent are required" });
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    return res.status(400).json({ message: "Coupon code already exists" });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountPercent,
    active: active !== undefined ? active : true,
    validFrom,
    validTo,
    courses: courses || [],
  });

  res.status(201).json({ success: true, data: coupon });
});

export const updateCoupon = catchAsync(async (req, res) => {
  const { code, discountPercent, active, validFrom, validTo, courses } = req.body;

  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });

  if (code && code.toUpperCase() !== coupon.code) {
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    coupon.code = code.toUpperCase();
  }

  if (discountPercent !== undefined) coupon.discountPercent = discountPercent;
  if (active !== undefined) coupon.active = active;
  if (validFrom !== undefined) coupon.validFrom = validFrom;
  if (validTo !== undefined) coupon.validTo = validTo;
  if (courses !== undefined) coupon.courses = courses;

  await coupon.save();

  res.json({ success: true, data: coupon });
});

export const deleteCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  res.json({ success: true, message: "Coupon deleted successfully" });
});


