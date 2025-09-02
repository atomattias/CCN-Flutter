import { Schema, model, Document } from "mongoose";
import { UserDocument } from "./userModel";

export interface Meeting {
  hostId: string;
  hostName: string;
  startTime: Date;
  members: Array<UserDocument>;
}

export interface MeetingDocument extends Document, Meeting {}

const meetingSchema = new Schema<MeetingDocument>(
  {
    hostId: {
      type: String,
      required: true,
      trim: true,
    },
    hostName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      default: Date.now(),
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export default model<MeetingDocument>("Meeting", meetingSchema);
