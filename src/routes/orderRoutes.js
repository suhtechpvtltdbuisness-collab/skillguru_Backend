import express from "express";
import { cashfreeWebhook, createOrder, getAllOrders, getOrderById, myOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/cashfree/webhook", express.json({ type: "application/json" }), cashfreeWebhook); // public webhook

// User routes
router.post("/", protect, createOrder);
router.get("/me", protect, myOrders);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.get("/:id", protect, authorizeRoles("admin"), getOrderById);
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

export default router;


