import express from "express";
import AdmmissionRoutes from "./AdmissionRoutes.js";
import authRoutes from "./authRoutes.js";
import contactRoutes from "./contactRoutes.js";
import courseRoutes from "./courseRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import NewsllatterRoutes from "./newslatterRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/contact", contactRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/newsletter" ,NewsllatterRoutes)
router.use("/admisssion" ,AdmmissionRoutes )

export default router;
