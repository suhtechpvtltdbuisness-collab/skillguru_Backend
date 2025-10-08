import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "pending", "paid", "failed", "refunded"], default: "created" },
    provider: { type: String, default: "cashfree" },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
    paymentLink: { type: String },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;


