import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  provider: { type: String }, // e.g., 'stripe', 'razorpay'
  providerPaymentId: { type: String },
  status: { type: String, enum: ["pending","success","failed","refunded"], default: "pending" },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
