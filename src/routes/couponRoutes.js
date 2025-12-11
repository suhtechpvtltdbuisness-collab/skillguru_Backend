import express from "express";
import { applyCoupon, createCoupon, deleteCoupon, getAllCoupons, getCouponById, updateCoupon } from "../controllers/couponController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/apply", protect, applyCoupon);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllCoupons);
router.get("/:id", protect, authorizeRoles("admin"), getCouponById);
router.post("/", protect, authorizeRoles("admin"), createCoupon);
router.put("/:id", protect, authorizeRoles("admin"), updateCoupon);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCoupon);

export default router;


