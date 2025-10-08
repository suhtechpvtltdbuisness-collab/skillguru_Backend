import express from "express";
import { myDashboard, myCourseDetail } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/me", myDashboard);
router.get("/courses/:courseId", myCourseDetail);

export default router;


