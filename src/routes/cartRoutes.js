import express from "express";
import { addToCart, clearCart, getMyCart, removeFromCart } from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/me", getMyCart);
router.post("/items", addToCart);
router.delete("/items/:courseId", removeFromCart);
router.delete("/clear", clearCart);

export default router;


