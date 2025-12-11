import express from "express";
import {
  getAllSubscribers,
  submitNewsletter
} from "../controllers/newslatterController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route
router.post("/", submitNewsletter);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllSubscribers);

export default router;
