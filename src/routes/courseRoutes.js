import express from "express";
import { createCourse, listCourses, getCourse } from "../controllers/courseController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listCourses);
router.get("/:id", getCourse);
router.post("/", protect, authorizeRoles("teacher","admin"), createCourse);

export default router;
