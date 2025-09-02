import type { Server, Socket } from "socket.io";
import {
  ChannelModel as Channel,
  MessageModel as Message,
  ChanelDocument,
  MessageDocument,
} from "../models/messageModel";
import { BaseController } from "./base";
import type { Request, Response } from "express";
import z from "zod";
import { UserDocument } from "../models/userModel";
import { ObjectId, Types } from "mongoose";

export const handleReadReceipt = async (
  io: Server,
  socket: Socket,
  messageId: string
) => {
  await Message.findByIdAndUpdate(messageId, {
    $push: { readReceipt: { user: socket.id, timestamp: Date.now() } },
  });

  io.emit("readReceiptAdded", {
    messageId,
    reader: socket.id,
    timestamp: Date.now(),
  });
};

export class ChatController extends BaseController {
  io: Server;

  constructor(io: Server) {
    super();
    this.io = io;
  }

  private sendMessage = async (opt: {
    user: string;
    channel: string;
    content: string;
    parent?: string;
    forwarded?: boolean;
    fromChannel?: string;
  }) => {
    try {
      const message = await Message.create({
        content: opt.content,
        channelID: opt.channel,
        parentMessage: opt.parent,
        user: opt.user,
        forwarded: opt.forwarded,
        fromChannel: opt.fromChannel,
      });
      return message;
    } catch (e) {
      console.log(e);
    }
  };

  createChannel = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const schema = z.object({
      name: z.string(),
      description: z.string(),
      users: z.array(z.string().optional()).optional(),
      tag: z.string(),
      specialty: z.boolean(),
    });

    const r = schema.safeParse(req.body);

    if (!r.success) {
      return res
        .status(403)
        .json({ error: "name, description, or users is required" });
    }

    try {
      const channel = await Channel.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${r.data.name}$`, "i") } }, // case-insensitive match
        {
          name: r.data.name,
          description: r.data.description,
          owner: user.id,
          users: r.data.users,
          tag: r.data.tag,
          specialty: r.data.specialty,
        },
        { upsert: true, new: true, runValidators: true }
      ).exec();

      return res.json({
        success: true,
        data: channel,
      });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  };

  addToChannel = async (req: Request, res: Response) => {
    const user = this.getUser(req);

    const r = z
      .object({
        id: z.string(),
        users: z.array(z.string()),
      })
      .safeParse(req.body);
    if (!r.success) {
      return res.status(403).json({ error: "users / channelID is required" });
    }
    try {
      const channel = await Channel.findOne({
        _id: r.data.id,
        owner: user.id,
      });

      if (!channel) {
        return res.status(404).json({ error: "channel not found" });
      }
      channel.users.push(r.data.users);
      await channel.save();
      return res.status(204).json(channel.toObject());
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  };

  getChannels = async (req: Request, res: Response) => {
    try {
      const channels = await Channel.find()
        .populate("owner users", "fullname role")
        .exec();

      if (channels.length === 0) {
        return res.json({
          success: true,
          data: [],
        });
      }

      return res.json(channels.map((e) => e.toObject()));
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: err });
    }
  };

  getChannelsByUser = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    console.log(user.id);
    try {
      const channels = await Channel.find({ users: { $in: [user.id] } })
        .populate("owner users", "fullname role")
        .exec();
      res.status(200).json({
        success: true,
        data: channels,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  private validateChannel = async (socket: Socket, channelID: string) => {
    const user = this.getIoUser(socket);
    const channel = await Channel.findOne({
      _id: channelID,
    });
    if (!channel) {
      throw new Error("channel not found");
    }

    if (
      channel.users.map((e) => e.toString()).includes(user.id!.toString()) ||
      channel.owner!.toString() === user.id
    ) {
      console.log("Joining channel messages", channelID);
      socket.join(channelID);

      socket.on("typing", (data) => {
        if (data.typing) {
          console.log(data);
          socket.emit("display", data);
        }
      });

      socket.on("message", async (data, file) => {
        if (typeof data === "string") {
          try {
            const message = await this.sendMessage({
              user: user.id!.toString(),
              channel: channelID,
              content: data,
            });
            if (message!.user && typeof message!.user === "object") {
              const userObject = message!.user as UserDocument;
              const emitMessage = {
                ...message!.toObject(),
                user: {
                  _id: userObject._id,
                  fullname: userObject.fullname,
                },
              };
              console.log(channelID);
              socket
                .to(message!.channelID!.toString())
                .emit("message", emitMessage);
            }
          } catch (error) {
            console.error(error);
          }
        }
      });
    }
  };

  handleSocket = async (socket: Socket) => {
    const { channel } = socket.handshake.query;
    if (channel && typeof channel === "string") {
      try {
        await this.validateChannel(socket, channel);
      } catch (e) {
        throw e;
      }
    }
  };

  getMessages = async (req: Request, res: Response) => {
    const r = z.object({ channelId: z.string() }).safeParse(req.body);

    if (!r.success) {
      return res.status(403).json({
        success: false,
        data: "Channel ID is required",
      });
    }

    try {
      const messages = await Message.find({
        channelID: r.data.channelId,
      })
        .populate("fromChannel user", "name fullname")
        .exec();

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  editMessage = async (req: Request, res: Response) => {
    const r = z
      .object({
        id: z.string(),
        content: z.string(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        r.data.id,
        { content: r.data.content },
        { new: true }
      )
        .populate("user", "fullname")
        .exec();

      if (!updatedMessage) {
        return res.status(400).json({
          success: false,
          error: "Message not found",
        });
      }

      // Emit an event to notify clients about the edited message
      this.io.to(updatedMessage.channelID!.toString()).emit("editedMessage", {
        messageId: updatedMessage._id,
        content: updatedMessage.content,
        user: {
          _id: updatedMessage.user._id,
          fullname: updatedMessage.user,
        },
      });

      res.status(200).json({
        success: true,
        data: updatedMessage,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };
  forwardMessage = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const r = z
      .object({
        message: z.string(),
        tag: z.string(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const channel = await Channel.findOne({ tag: r.data.tag }).exec() as ChanelDocument | null;
      if (!channel) {
        return res.status(400).json({
          success: false,
          error: `No channel exist with tag ${r.data.tag}`,
        });
      }

      const message = await Message.findOne({ _id: r.data.message }).exec() as MessageDocument | null;

      console.log(message);

      if (!message) {
        return res.status(400).json({
          success: false,
          error: `Message not found`,
        });
      }

      const forward = {
        user: user.id,
        channel: (channel._id as any).toString(),
        fromChannel: message.channelID?.toString(),
        content: message.content,
        forwarded: true,
      };

      const forwardedMessage = await this.sendMessage(forward);

      this.io.to((channel._id as any).toString()).emit("message", {
        messageId: forwardedMessage!._id,
        content: forwardedMessage!.content,
        forwarded: forwardedMessage?.forwarded,
        user: {
          _id: forwardedMessage!.user._id,
          fullname: forwardedMessage!.user,
        },
      });

      res.status(200).json({
        success: true,
        data: forwardedMessage,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };
}
