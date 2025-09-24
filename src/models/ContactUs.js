import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  callbackRequested: { type: Boolean, default: false },
  processed: { type: Boolean, default: false },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SkillGuruUser" },
}, { timestamps: true });

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
export default ContactUs;
