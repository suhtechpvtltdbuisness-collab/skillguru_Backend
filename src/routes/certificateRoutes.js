import express from "express";
import { issueCertificate, verifyCertificate } from "../controllers/certificateController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/verify/:id", verifyCertificate);
router.post("/issue/:courseId", protect, issueCertificate);

export default router;


