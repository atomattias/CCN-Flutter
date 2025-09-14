import { BaseController } from "./base";
import { Request, Response } from "express";
import { FileModel } from "../models/fileModel";
import path from "path";
import multer, { memoryStorage } from "multer";

export class FileController extends BaseController {
  private storage = memoryStorage();
  private upload = multer({ storage: this.storage });

  getAllFiles = async (req: Request, res: Response) => {
    try {
      const files = await FileModel.find();
      res.status(200).json(files);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };

  getFileById = async (req: Request, res: Response) => {
    try {
      const fileId = req.params.fileId;

      if (!fileId) {
        return res.status(400).send({ error: "File ID is required" });
      }

      const file = await FileModel.findById(fileId);

      if (!file) {
        return res.status(404).send({ error: "File not found" });
      }

      res.status(200).json(file);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };

  sendDocumentFile = this.upload.single("file");

  sendDocumentFileHandler = async (req: Request, res: Response) => {
    try {
      const userId = this.getUser(req);
      const channelID = req.body.channelID;
      const fileBuffer = req.file?.buffer;
      const fileName = req.file?.originalname;
  
      if (!userId || !channelID || !fileBuffer || !fileName) {
        return res.status(400).send({ error: "Invalid request parameters" });
      }

      // Determine the file type based on the file name    
      // 65daedcdc28d9b0dbd560a91
      // channel 65d7485a9d71f2e6bc9a4a2b
      const fileType = this.determineFileType(fileName);

      // Create a new node document
      const newFile = new FileModel({
        userId: userId,
        channelID: channelID,
        url: `/uploads/${fileName}`,
        fileType: fileType,
        fileName: fileName,
        fileData: fileBuffer,
      });

      await newFile.save();

      res.status(200).send({ message: "File received successfully", newFile: newFile });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };


  forwardFile = async (req: Request, res: Response) => {
    try {
      const { fileId, fromChannelId, toChannelId } = req.body;
      const userId = this.getUser(req);

      // Validate request parameters
      if (!fileId || !fromChannelId || !toChannelId || !userId) {
        return res.status(400).send({ error: "Invalid request parameters" });
      }

      // Retrieve file to be forwarded
      const fileToForward = await FileModel.findById(fileId);

      if (!fileToForward) {
        return res.status(404).send({ error: "File not found" });
      }

      // Create a copy of the file for the destination channel
      const forwardedFile = new FileModel({
        userId: fileToForward.userId,
        channelID: toChannelId,
        url: fileToForward.url,
        fileType: fileToForward.fileType,
        fileName: fileToForward.fileName,
        fileData: fileToForward.fileData,
      });
      await forwardedFile.save();

      res.status(200).send({ message: "File forwarded successfully", forwardedFile: forwardedFile });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };


  updateFile = async (req: Request, res: Response) => {
    try {
      const fileId = req.params.Id;
      const userId = this.getUser(req);
      const fileBuffer = req.file?.buffer;
      const fileName = req.file?.originalname;
      // Find the file in the database based on fileId
      if (!fileId) {
        return res.status(400).send({ error: "File ID is required" });
      }

      const fileToUpdate = await FileModel.findById(fileId);
  
      // Check if the file exists
      if (!fileToUpdate) {
        return res.status(404).json({ error: "File not found" });
      }
  
      if (typeof fileName !== 'string') {
        return res.status(400).send({ error: "Invalid file name" });
      }

      // Check if the user is authorized to update the file
      if (fileToUpdate.userId.toString() !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not own this file" });
      }

      const fileType = this.determineFileType(fileName);
  
      // Update the file properties
      fileToUpdate.userId = userId;
      fileToUpdate.channelID = fileToUpdate.channelID;
      fileToUpdate.url = `/uploads/${fileName}`;
      fileToUpdate.fileType = fileType;
      fileToUpdate.fileName = fileName;
      fileToUpdate.fileData = fileBuffer;
  
      // Save the updated file in the database
      await fileToUpdate.save();
  
      // Send a success response with the updated file
      res.status(200).json({ message: "File updated successfully", updatedFile: fileToUpdate });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  deleteFileById = async (req: Request, res: Response) => {
    try {
      const fileId = req.params.id;

      if (!fileId) {
        return res.status(400).send({ error: "File ID is required" });
      }

      const file = await FileModel.findById(fileId);

      if (!file) {
        return res.status(404).send({ error: "File not found" });
      }

      await FileModel.findByIdAndDelete(fileId);

      res.status(200).send({ message: "File deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };

  private determineFileType(fileName: string): string {
    // Determine the file type based on the file name
    const fileExtension = path.extname(fileName).toLowerCase();

    switch (fileExtension) {
      case ".pdf":
        return "pdf";
      case ".doc":
        return "doc";
      case ".doc":
        return "docx";
      case ".mp3":
        return "voiceNote";
      case ".mp4":
        return "videoCall";
      case ".png":
        return "picture";
      case ".jpg":
        return "picture";
      default:
        return "unknown";
    }
  }
}
