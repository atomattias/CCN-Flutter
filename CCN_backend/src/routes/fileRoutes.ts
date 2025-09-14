import { Router } from "express";
import { FileController } from "../controllers/fileController";
import middlewares from "../utils/middlewares";

const router = Router();

const controller = new FileController();

router.get("/files", controller.getAllFiles);
router.get("/:fileId", controller.getFileById);
router.post(
  "/sendfile",
  controller.sendDocumentFile,
  controller.sendDocumentFileHandler
);
router.post("/forward-file", controller.forwardFile);
router.put("/:Id", controller.sendDocumentFile, controller.updateFile);
router.delete("/:id", controller.deleteFileById);

export default router;
