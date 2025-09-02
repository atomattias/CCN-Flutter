import mongoose, { Date, Document, Schema, Types } from "mongoose";
import { User, UserDocument } from "./userModel";

export interface Message {
  user: Types.ObjectId | UserDocument;
  content: string;
  timestamp: number;
  parentMessage?: Types.ObjectId;
  recipient?: Types.ObjectId | UserDocument;
  fromChannel?: Types.ObjectId | UserDocument;
  channelID?: Types.ObjectId;
  forwarded?: boolean;
  read?: boolean;
  readReceipt?: { user: Types.ObjectId; timestamp: number }[];
}

export interface MessageDocument extends Document, Message {}

const messageSchema = new Schema<MessageDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    content: { type: String, trim: true },
    parentMessage: { type: Schema.Types.ObjectId, ref: "Message", trim: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", trim: true },
    channelID: { type: Schema.Types.ObjectId, ref: "Channel", trim: true },
    fromChannel: {type: Schema.Types.ObjectId, ref: "Channel", trim: true},
    forwarded: {type: Boolean},
    read: { type: Boolean, default: false },
    readReceipt: [
      { user: { type: Schema.Types.ObjectId, ref: "User" }, timestamp: Number },
    ],
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

messageSchema.post('save', async function (doc, next) {
  await this.model('Message').populate(doc, { path: 'user' });
  next();
});

export const MessageModel = mongoose.model<MessageDocument>(
  "Message",
  messageSchema
);

export interface Channel {
  owner: Types.ObjectId | UserDocument;
  name: string;
  description: string;
  tag: string;
  specialty: boolean;
  users: Types.Array<Types.ObjectId | UserDocument >;
}

export interface ChanelDocument extends Document, Channel {}

const chanelSchema = new Schema<ChanelDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", unique: false, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, trim: true },
    tag: {type: String , unique: true},
    specialty: {type: Boolean, default: false},
      users: [{ type: Schema.Types.ObjectId, ref: "User"}],
  },
  { timestamps: true }
);

export const ChannelModel = mongoose.model<ChanelDocument>(
  "Channel",
  chanelSchema
);
