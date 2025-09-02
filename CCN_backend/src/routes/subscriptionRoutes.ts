import { Router } from "express";
import { SubscriptionController } from "../controllers/subscriptionController";

const router = Router();

// controller
const controller = new SubscriptionController();

// routes [access level: user]
router.get("/", controller.getSubscriptions);
router.post("/subscribe", controller.subscribe);
router.put("/verify-payment", controller.verifyPayment);

export default router;
