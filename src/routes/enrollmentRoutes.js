import express from "express";
import { enroll, getEnrollmentStats, myEnrollments } from "../controllers/enrollmentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, enroll);
router.get("/me", protect, myEnrollments);
router.get("/enrolment-number-course-wise" , protect ,   authorizeRoles("admin"),getEnrollmentStats  )

export default router;
