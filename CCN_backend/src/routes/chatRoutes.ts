import { Router, Request, Response } from "express";
import type { Server } from "socket.io";
import {
  handleReadReceipt,
  ChatController,
} from "../controllers/chatController";
import middlewares from "../utils/middlewares";
import { ROLE } from "../models/userModel";

export class ChatRouter extends ChatController {
  io: Server;
  router: Router;

  constructor(io: Server) {
    super(io);
    this.io = io;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes = () => {
    this.router.post(
      "/create-channel",
      middlewares.authRole([ROLE.SUPERUSER, ROLE.ADMIN]),
      this.createChannel
    );
    this.router.put(
      "/channel/users",
      middlewares.authRole([ROLE.SUPERUSER, ROLE.ADMIN]),
      this.addToChannel
    );
    this.router.get(
      "/channels",
      middlewares.authRole([ROLE.SUPERUSER, ROLE.ADMIN, ROLE.CLINICIAN]),
      this.getChannels
    );
    this.router.get(
      "/channel",
      middlewares.authRole([ROLE.SUPERUSER, ROLE.ADMIN, ROLE.CLINICIAN]),
      this.getChannelsByUser
    );
    this.router.get(
      "/messages",
      middlewares.authRole([ROLE.SUPERUSER, ROLE.ADMIN, ROLE.CLINICIAN]),
      this.getMessages
    );
    this.router.post(
      "/forward",
      middlewares.authRole([ROLE.SUPERUSER, ROLE.ADMIN, ROLE.CLINICIAN]),
      this.forwardMessage
    );
    this.router.put("/message", this.editMessage);
  };
}
