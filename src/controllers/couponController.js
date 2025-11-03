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


