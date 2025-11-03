import express from "express";
import { createReview, getCourseReviews } from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/courses/:courseId", getCourseReviews);
router.post("/courses/:courseId", protect, createReview);

export default router;


