import express from "express";
import { getAllStudents, getProfile, getStudentById, updateProfile } from "../controllers/userController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

// Admin routes
router.get("/students", protect, authorizeRoles("admin"), getAllStudents);
router.get("/students/:id", protect, authorizeRoles("admin"), getStudentById);

export default router;


