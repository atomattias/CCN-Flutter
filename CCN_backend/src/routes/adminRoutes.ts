import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { SubscriptionController } from "../controllers/subscriptionController";

const router = Router();

// controllers
const adminController = new AdminController();
const subscriptionController = new SubscriptionController();

// routes [access level: admins]
router.get("/users", adminController.getUsers)
router.post("/create-subscription", subscriptionController.createSubscription);
router.put("/:id", subscriptionController.updateSubscription);
router.put("/verify-account", adminController.verifyAccount);
router.delete("/subscription/:id", subscriptionController.deleteSubscription);

export default router;
