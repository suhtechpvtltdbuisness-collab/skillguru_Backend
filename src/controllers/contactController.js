import { ContactUs } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/sendEmail.js";


export const contactTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting SkillGuru</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header h2 {
      color: #10b981; /* SkillGuru green */
      margin: 0;
    }
    .content {
      font-size: 16px;
      color: #333333;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #10b981;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>SkillGuru</h2>
    </div>
    <div class="content">
      <p>Hi ${name || "there"},</p>
      <p>Thank you for contacting SkillGuru! We’ve received your message and our team will get back to you shortly.</p>
      <p>If you requested a callback, we will reach you at the provided phone number as soon as possible.</p>
      <p>Meanwhile, feel free to explore our courses and resources to enhance your skills!</p>
      <a href="https://skillguru.com" class="button">Visit SkillGuru</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SkillGuru. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;


export const submitContact = catchAsync(async (req, res) => {
  const { name, email, phone, message, callbackRequested } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required" });
  }

  const contact = await ContactUs.create({
    name,
    email,
    phone,
    message,
    callbackRequested: callbackRequested || false,
  });

await sendEmail({
  to: email,
  subject: "Thank You for Contacting SkillGuru!",
  html: contactTemplate(name),
});


  res.status(201).json({ success: true, data: contact, message: "Submitted successfully" });
});


export const getAllContacts = catchAsync(async (req, res) => {
  const contacts = await ContactUs.find().populate("processedBy", "name email");
  res.status(200).json({ success: true, data: contacts });
});


export const getContactById = catchAsync(async (req, res) => {
  const contact = await ContactUs.findById(req.params.id).populate("processedBy", "name email");

  if (!contact) {
    return res.status(404).json({ success: false, message: "Contact not found" });
  }

  res.status(200).json({ success: true, data: contact });
});


export const markContactProcessed = catchAsync(async (req, res) => {
  const contact = await ContactUs.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({ success: false, message: "Contact not found" });
  }

  contact.processed = true;
  contact.processedBy = req.user?.id || null; // If you have authentication middleware
  await contact.save();

  res.status(200).json({ success: true, data: contact, message: "Marked as processed" });
});
