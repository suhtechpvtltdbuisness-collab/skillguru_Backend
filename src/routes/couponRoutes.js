import express from "express";
import { applyCoupon } from "../controllers/couponController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/apply", applyCoupon);

export default router;


