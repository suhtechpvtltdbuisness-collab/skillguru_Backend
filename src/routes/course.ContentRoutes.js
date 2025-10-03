import express from "express";
import {
  createCourseContent,
  deleteCourseContent,
  getCourseContent,
  updateCourseContent,
} from "../controllers/courseContentController.js";

import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createCourseContentValidator,
  updateCourseContentValidator,
} from "../validators/courseContentValidator.js";

const router = express.Router({ mergeParams: true });


router.post(
  "/",
  protect,
  authorizeRoles("teacher", "admin"),
  validate(createCourseContentValidator),
  createCourseContent
);

router.get("/", getCourseContent);

router.put(
  "/",
  protect,
  authorizeRoles("teacher", "admin"),
  validate(updateCourseContentValidator),
  updateCourseContent
);

router.delete(
  "/",
  protect,
  authorizeRoles("admin"),
  deleteCourseContent
);

export default router;
