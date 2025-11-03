import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true, uppercase: true, trim: true },
    discountPercent: { type: Number, min: 1, max: 100, required: true },
    active: { type: Boolean, default: true },
    validFrom: { type: Date },
    validTo: { type: Date },
    courses: { type: [mongoose.Schema.Types.ObjectId], ref: "Course", default: [] },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;


