import express from "express";
import { getAdmissionById, getAdmissions, markAdmissionProcessed, submitAdmission } from "../controllers/admissionController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";





const router = express.Router();
router.post("/",  submitAdmission);

router.get("/", protect, authorizeRoles("teacher", "admin"), getAdmissions);
router.get("/:id", protect, authorizeRoles("teacher", "admin"), getAdmissionById);

router.patch("/:id/process", protect, authorizeRoles("teacher", "admin"), markAdmissionProcessed);


export default router;
