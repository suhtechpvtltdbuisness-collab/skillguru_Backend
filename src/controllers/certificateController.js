import { Certificate, Enrollment } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";

export const issueCertificate = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId }).populate("course");
  if (!enrollment) return res.status(404).json({ message: "Not enrolled" });

  let cert = await Certificate.findOne({ user: req.user._id, course: courseId });
  if (!cert) {
    cert = await Certificate.create({ user: req.user._id, course: courseId });
  }

  res.json({ success: true, data: cert });
});

export const verifyCertificate = catchAsync(async (req, res) => {
  const { id } = req.params; // certificateId
  const cert = await Certificate.findOne({ certificateId: id }).populate({ path: "user", select: "name" }).populate({ path: "course", select: "title" });
  if (!cert) return res.status(404).json({ valid: false });
  res.json({ success: true, valid: true, data: cert });
});


