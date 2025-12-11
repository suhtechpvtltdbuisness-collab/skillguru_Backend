import express from "express";
import { downloadCertificate, getAllCertificates, getMyCertificates, issueCertificate, verifyCertificate } from "../controllers/certificateController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/verify/:id", verifyCertificate);

// User routes
router.get("/me", protect, getMyCertificates);
router.post("/issue/:courseId", protect, issueCertificate);
router.get("/:id/download", protect, downloadCertificate);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllCertificates);

export default router;


