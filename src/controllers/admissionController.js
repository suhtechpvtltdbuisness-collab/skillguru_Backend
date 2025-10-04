
import { Admmission } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";

// Newsletter HTML template
const admissionTemplate = (userEmail, firstName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #2c3e50;">Thank You for Your Admission Query!</h2>
    <p>Hi ${firstName || "there"},</p>
    <p>We’ve received your admission query and our team will get back to you shortly with all the necessary details. We’re excited to assist you on your learning journey with SkillGuru!</p>
    <p>In the meantime, feel free to explore our latest courses and resources.</p>
    <p style="margin-top: 20px;">Best regards,<br><strong>SkillGuru Team</strong></p>
    <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
    <p style="font-size: 12px; color: #999;">If you did not submit an admission query, please ignore this email.</p>
  </div>
`;


export const submitAdmission = catchAsync(async (req, res) => {
  const { email, first_name, contact_no, last_name } = req.body;
console.log(req.body , "req.body")
  // Check if email already exists
  const existing = await Admmission.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "This email is already subscribed" });
  }

  // Save admission to database
  const newAdmission = await Admmission.create({
    email,
    first_name,
    last_name,
    contact_no,
  });

  // Send confirmation email
  await sendEmail({
    to: email,
    subject: "Thank You for Your Admission Query!",
    html: admissionTemplate(email, first_name),
  });

  res.status(201).json({
    success: true,
    data: newAdmission,
    message: "Admission form submitted successfully",
  });
});



export const getAdmissions = catchAsync(async (req, res) => {
  const admissions = await Admmission.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: admissions.length,
    data: admissions, // this includes isProcessed, reachCount, references, etc.
  });
});


export const getAdmissionById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const admission = await Admmission.findById(id);

  if (!admission) {
    return res.status(404).json({ success: false, message: "Admission not found" });
  }

  res.status(200).json({
    success: true,
    data: admission,
  });
});
export const markAdmissionProcessed = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const userId = req.user?.id || "system";

  const admission = await Admmission.findById(id);
  if (!admission) {
    return res.status(404).json({ success: false, message: "Admission not found" });
  }

  // Initialize references array if undefined
  admission.references = admission.references || [];

  // Push new reference
  admission.references.push({ note, addedBy: userId });
  admission.reachCount = (admission.reachCount || 0) + 1;
  admission.isProcessed = true;

  await admission.save();

  res.status(200).json({
    success: true,
    message: "Reference added successfully",
    data: admission,
  });
});
