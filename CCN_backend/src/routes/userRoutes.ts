import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

// controller
const controller = new UserController();

// routes [access level: user]
router.put("/update-details", controller.updateDetails);
router.put("/change-password", controller.changePassword);

export default router;
