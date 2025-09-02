import mongoose, { Schema } from "mongoose";
import { number } from "zod";

export enum STATUS {
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  INACTIVE = "inactive",
}

export enum CYCLE {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface Subscription extends Document {
  planDetails: {
    type: string;
    price: number;
  };
  description: string;
  cycle: string;
}

export interface UserSubscription {
  subscriptionId: String;
  userId: String;
  status: STATUS;
  startDate: Date;
  endDate: Date;
  autoRenew: Boolean;
  cancellationReason: String | null;
  discount: {
    code: String;
    percentage: number;
  };
}
export interface SubscriptionDocument
  extends Document,
    Subscription,
    UserSubscription {}

const subscriptionModel: Schema = new Schema<SubscriptionDocument>(
  {
    planDetails: {
      type: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    description: { type: String },
    cycle: { type: String, required: true },
  },
  { timestamps: true }
);

const userSubscription: Schema = new Schema<SubscriptionDocument>(
  {
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.INACTIVE,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      default: Date.now(),
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancellationReason: String,
    discount: {
      type: {
        code: String,
        percentage: Number,
      },
    },
  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.model<SubscriptionDocument>(
  "Subscription",
  subscriptionModel
);

export const UserSubscriptionModel = mongoose.model<SubscriptionDocument>(
  "UserSubscription",
  userSubscription
);
