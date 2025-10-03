import express from "express";
import { loginUser, registerUser, verifyEmail } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { userValidators } from "../validators/index.js";

const router = express.Router();


router.post("/register", validate(userValidators.registerValidator), registerUser);


router.post("/login", validate(userValidators.loginValidator), loginUser);

router.get("/verify-email", verifyEmail);

export default router;
