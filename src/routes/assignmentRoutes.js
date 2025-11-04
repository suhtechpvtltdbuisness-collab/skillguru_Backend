import express from "express";
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignmentSubmissions,
  getCourseAssignments,
  getMySubmissions,
  getSubmission,
  gradeAssignment,
  submitAssignment,
  updateAssignment
} from "../controllers/assignmentController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/course/:courseId", getCourseAssignments);
router.get("/:id", getAssignment);

// Protected routes (Students)
router.use(protect);
router.post("/:id/submit", submitAssignment);
router.get("/:id/submission", getSubmission);
router.get("/submissions/me", getMySubmissions);

// Teacher/Admin only routes
router.post("/", authorizeRoles("teacher", "admin"), createAssignment);
router.put("/:id", authorizeRoles("teacher", "admin"), updateAssignment);
router.delete("/:id", authorizeRoles("admin"), deleteAssignment);
router.get("/:id/submissions", authorizeRoles("teacher", "admin"), getAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", authorizeRoles("teacher", "admin"), gradeAssignment);

export default router;
