import express from "express";
import { enroll, myEnrollments } from "../controllers/enrollmentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, enroll);
router.get("/me", protect, myEnrollments);

export default router;
