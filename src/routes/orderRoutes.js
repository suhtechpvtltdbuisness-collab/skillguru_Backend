import express from "express";
import { createOrder, myOrders, cashfreeWebhook } from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/cashfree/webhook", express.json({ type: "application/json" }), cashfreeWebhook); // public webhook

router.use(protect);
router.post("/", createOrder);
router.get("/me", myOrders);

export default router;


