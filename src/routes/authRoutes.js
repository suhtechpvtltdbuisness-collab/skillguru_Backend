import express from "express";
import { addEmployee, authStatus, getAllEmployees, getCurrentUser, loginUser, refreshAccessToken, registerUser, resendVerification, verifyEmail } from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { userValidators } from "../validators/index.js";

const router = express.Router();


router.post("/register", validate(userValidators.registerValidator), registerUser);


router.post("/login", validate(userValidators.loginValidator), loginUser);

router.get("/verify-email", verifyEmail);

router.post("/resend-verification" , resendVerification)

router.get("/users", protect, authorizeRoles("admin"), getAllEmployees);

router.post("/users/add", protect, authorizeRoles("admin"), addEmployee);

// Current authenticated user
router.get("/me", protect, getCurrentUser);

// Auth status and refresh
router.get("/status", authStatus);
router.post("/refresh", refreshAccessToken);

export default router;
