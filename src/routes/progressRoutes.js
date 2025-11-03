import express from "express";
import { getProgress, toggleLesson } from "../controllers/progressController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/:courseId", getProgress);
router.post("/:courseId/toggle", toggleLesson);

export default router;


