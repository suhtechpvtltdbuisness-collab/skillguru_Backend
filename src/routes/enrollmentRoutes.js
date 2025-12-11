import express from "express";
import { enroll, getAllEnrollments, getEnrollmentById, getEnrollmentStats, myEnrollments, updateEnrollmentStatus } from "../controllers/enrollmentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, enroll);
router.get("/me", protect, myEnrollments);

// Admin routes
router.get("/enrolment-number-course-wise", protect, authorizeRoles("admin"), getEnrollmentStats);
router.get("/", protect, authorizeRoles("admin"), getAllEnrollments);
router.get("/:id", protect, authorizeRoles("admin"), getEnrollmentById);
router.put("/:id/status", protect, authorizeRoles("admin"), updateEnrollmentStatus);

export default router;
