import { Newsletter } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";

// Newsletter HTML template
const newsletterTemplate = (userEmail) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #2c3e50;">Thank You for Subscribing!</h2>
    <p>Hi there,</p>
    <p>We’re thrilled to have you on board. You’ve successfully subscribed to the SkillGuru newsletter and will now receive the latest updates, courses, and special offers directly in your inbox.</p>
    <p>Stay tuned!</p>
    <p style="margin-top: 20px;">Best regards,<br><strong>SkillGuru Team</strong></p>
    <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
    <p style="font-size: 12px; color: #999;">If you didn’t subscribe to our newsletter, please ignore this email.</p>
  </div>
`;

export const submitNewsletter = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Check if email already exists
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "This email is already subscribed" });
  }

  // Save email to database
  const contact = await Newsletter.create({ email });

  // Send confirmation email
  await sendEmail({
    to: email,
    subject: "Thank You for Subscribing to SkillGuru!",
    html: newsletterTemplate(email),
  });

  res.status(201).json({ success: true, data: contact, message: "Subscribed successfully" });
});
