import crypto from "crypto";
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.pre("save", function (next) {
  if (!this.certificateId) {
    this.certificateId = crypto.randomBytes(10).toString("hex");
  }
  next();
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;


