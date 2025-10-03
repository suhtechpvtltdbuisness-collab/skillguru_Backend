import express from "express";
import {
  getAllContacts,
  getContactById,
  markContactProcessed,
  submitContact,
} from "../controllers/contactController.js";

import { validate } from "../middlewares/validateMiddleware.js";
import { submitContactValidator } from "../validators/contact.validators.js";

const router = express.Router();

router.post("/", validate(submitContactValidator), submitContact);


router.get("/", getAllContacts);


router.get("/:id", getContactById);


router.patch("/:id/process", markContactProcessed);

export default router;
