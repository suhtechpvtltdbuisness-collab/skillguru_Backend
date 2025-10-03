import express from "express";
import {
  submitNewsletter
} from "../controllers/newslatterController.js";



const router = express.Router();

router.post("/", submitNewsletter);


export default router;
