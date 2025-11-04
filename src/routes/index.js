import express from "express";
import AdmmissionRoutes from "./AdmissionRoutes.js";
import assignmentRoutes from "./assignmentRoutes.js";
import authRoutes from "./authRoutes.js";
import cartRoutes from "./cartRoutes.js";
import certificateRoutes from "./certificateRoutes.js";
import contactRoutes from "./contactRoutes.js";
import couponRoutes from "./couponRoutes.js";
import CoursecontentRoutes from "./course.ContentRoutes.js";
import courseRoutes from "./courseRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import NewsllatterRoutes from "./newslatterRoutes.js";
import orderRoutes from "./orderRoutes.js";
import progressRoutes from "./progressRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/contact", contactRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/reviews", reviewRoutes);
router.use("/certificates", certificateRoutes);
router.use("/progress", progressRoutes);
router.use("/coupons", couponRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/newsletter" ,NewsllatterRoutes)
router.use("/admission" ,AdmmissionRoutes )
router.use("/course-content" , CoursecontentRoutes )

export default router;
