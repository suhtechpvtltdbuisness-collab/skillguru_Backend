import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();




const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: "no-reply@suhtech.in",
    pass: "we5#Oy^6:Z5v",
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Email server connection failed:", err);
  } else {
    console.log("Email server is ready to take messages");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"SuHTech" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
