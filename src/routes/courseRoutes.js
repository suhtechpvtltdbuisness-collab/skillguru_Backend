
import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  popularCourses,
  updateCourse,
} from "../controllers/courseController.js";

import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createCourseValidator, updateCourseValidator } from "../validators/course.Validator.js";

const router = express.Router();

// ---- Public Routes ----
router.get("/", listCourses);
router.get("/popular", popularCourses);
router.get("/:id", getCourse);

// ---- Protected Routes ----
router.post(
  "/",
  protect,
  authorizeRoles("teacher", "admin"),
  validate(createCourseValidator),
  createCourse
);

router.put(
  "/:id",
  protect,
  authorizeRoles("teacher", "admin"),
  validate(updateCourseValidator),
  updateCourse
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteCourse
);

export default router;
