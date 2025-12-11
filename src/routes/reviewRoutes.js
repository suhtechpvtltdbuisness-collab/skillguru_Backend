import express from "express";
import { createReview, deleteReview, getAllReviews, getCourseReviews } from "../controllers/reviewController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public/User routes
router.get("/courses/:courseId", getCourseReviews);
router.post("/courses/:courseId", protect, createReview);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllReviews);
router.delete("/:id", protect, authorizeRoles("admin"), deleteReview);

export default router;


