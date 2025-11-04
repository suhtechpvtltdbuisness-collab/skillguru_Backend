import express from "express";
import { downloadCertificate, getMyCertificates, issueCertificate, verifyCertificate } from "../controllers/certificateController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/verify/:id", verifyCertificate);

// Protected routes
router.use(protect);
router.get("/me", getMyCertificates);
router.post("/issue/:courseId", issueCertificate);
router.get("/:id/download", downloadCertificate);

export default router;


