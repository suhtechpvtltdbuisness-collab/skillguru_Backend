import { ContactUs } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const submitContact = catchAsync(async (req, res) => {
  const { name, email, phone, message, callbackRequested } = req.body;
  const contact = await ContactUs.create({ name, email, phone, message, callbackRequested });
  res.status(201).json({ success: true, data: contact, message: "Submitted" });
});
