import express from "express";
import { submitAdmission } from "../controllers/admissionController.js";

import { validate } from "../middlewares/validateMiddleware.js";
import { admissionValidator } from "../validators/index.js";



const router = express.Router();
router.post("/admission", validate(admissionValidator), submitAdmission);


export default router;
