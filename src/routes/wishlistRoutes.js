import express from "express";
import { addToWishlist, getMyWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/me", getMyWishlist);
router.post("/items", addToWishlist);
router.delete("/items/:courseId", removeFromWishlist);

export default router;


