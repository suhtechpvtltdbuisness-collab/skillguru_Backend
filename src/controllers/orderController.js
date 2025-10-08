import { Cart, Course, Enrollment, Order } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

async function ensureCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  return cart || { user: userId, items: [] };
}

function calculateAmount(items) {
  return items.reduce((sum, it) => sum + (it.price || it.priceAtAdd || 0), 0);
}

export const createOrder = catchAsync(async (req, res) => {
  const { courseId } = req.body; // optional single course checkout
  let items = [];
  if (courseId) {
    const course = await Course.findById(courseId).select("_id price published");
    if (!course || !course.published) return res.status(404).json({ message: "Course not available" });
    items = [{ course: course._id, price: course.price }];
  } else {
    const cart = await ensureCart(req.user._id);
    items = cart.items.map((it) => ({ course: it.course, price: it.priceAtAdd }));
    if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });
  }

  // Prevent duplicates for already enrolled
  const courseIds = items.map((i) => i.course);
  const already = await Enrollment.find({ student: req.user._id, course: { $in: courseIds } }).select("course");
  const alreadyIds = new Set(already.map((e) => String(e.course)));
  items = items.filter((i) => !alreadyIds.has(String(i.course)));
  if (items.length === 0) return res.status(400).json({ message: "All selected courses already enrolled" });

  const amount = calculateAmount(items);

  const order = await Order.create({ user: req.user._id, items, amount, status: "created" });

  // Initiate Cashfree order
  const cfBase = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg";
  const cfAppId = process.env.CASHFREE_APP_ID;
  const cfSecret = process.env.CASHFREE_SECRET_KEY;
  if (!cfAppId || !cfSecret) {
    return res.status(500).json({ message: "Cashfree credentials not configured" });
  }

  const customer = {
    customer_id: String(req.user._id),
    customer_email: req.user.email || "no-email@example.com",
    customer_phone: req.user.phone || "0000000000",
    customer_name: req.user.name || "Student",
  };

  const body = {
    order_id: String(order._id),
    order_amount: amount,
    order_currency: "INR",
    customer_details: customer,
    order_meta: {
      return_url: `${process.env.FRONTEND_URL || "https://example.com"}/payments/cashfree/return?order_id={order_id}&order_token={order_token}`,
      notify_url: `${process.env.BACKEND_URL || ""}/api/v1/orders/cashfree/webhook`,
    },
  };

  const resp = await fetch(`${cfBase}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": cfAppId,
      "x-client-secret": cfSecret,
      "x-api-version": "2022-09-01",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return res.status(502).json({ message: "Cashfree order failed", details: errText });
  }

  const data = await resp.json();
  order.providerOrderId = data.order_id || data.cf_order_id || String(order._id);
  order.paymentLink = data.payment_link || data.payments?.url || null;
  order.status = "pending";
  await order.save();

  res.status(201).json({ success: true, data: order });
});

export const myOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.course", "title price thumbnailUrl");
  res.json({ success: true, data: orders });
});

// Webhook handler per Cashfree docs: verify signature and mark paid
import crypto from "crypto";

function verifyCashfreeSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const computed = crypto.createHmac("sha256", secret).update(payload).digest("base64");
  return computed === signature;
}

export const cashfreeWebhook = catchAsync(async (req, res) => {
  const signature = req.headers["x-webhook-signature"] || req.headers["x-webhook-signature"];
  const secret = process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY;
  const payload = JSON.stringify(req.body || {});

  const valid = verifyCashfreeSignature(payload, signature, secret);
  if (!valid) return res.status(401).json({ message: "Invalid signature" });

  const event = req.body?.type || req.body?.event || req.body?.data?.order?.status;
  const orderId = req.body?.data?.order?.order_id || req.body?.order?.order_id || req.body?.order_id;

  const order = await Order.findById(orderId).populate("items.course");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isPaid = req.body?.data?.order?.status === "PAID" || req.body?.data?.payment?.status === "SUCCESS" || /paid|success/i.test(String(event || ""));

  if (isPaid) {
    order.status = "paid";
    order.providerPaymentId = req.body?.data?.payment?.payment_id || order.providerPaymentId;
    await order.save();

    // Enroll user in purchased courses
    for (const it of order.items) {
      const exists = await Enrollment.findOne({ student: order.user, course: it.course });
      if (!exists) {
        await Enrollment.create({ student: order.user, course: it.course });
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
  } else if (req.body?.data?.order?.status === "FAILED") {
    order.status = "failed";
    await order.save();
  }

  res.json({ success: true });
});


