import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

// controller
const controller = new AuthController();

// routes [access level: user]
router.post("/send-otp", controller.sendOtp);
router.post("/create-account", controller.createAccount);
router.post("/signin", controller.signIn);
router.post("/create-pin", controller.createPin);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.put("/verify-otp", controller.verifyOtp);

export default router;
