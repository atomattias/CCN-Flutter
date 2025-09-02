import { BaseController } from "./base";
import { Request, Response } from "express";
import z from "zod";
import {
  CYCLE,
  STATUS,
  SubscriptionModel,
  UserSubscriptionModel,
} from "../models/subscriptionModel";
import { PAYSTACK_SECRET } from "../utils/secret";
import https from "https";
import mongoose from "mongoose";

export class SubscriptionController extends BaseController {
  options: any;
  constructor() {
    super();
    this.options = {
      hostname: "api.paystack.co",
      port: 443,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    };
  }

  createSubscription = async (req: Request, res: Response) => {
    const r = z
      .object({
        planDetails: z.object({
          type: z.string(),
          price: z.number(),
        }),
        cycle: z.string(),
      })
      .safeParse(req.body);

    if (!r.success)
      return res.status(400).json({ success: false, error: r.error });

    try {
      const exists = await SubscriptionModel.findOne({
        "planDetails.type": r.data.planDetails.type,
      }).exec();

      if (exists) {
        return res.status(400).json({
          success: false,
          error: "subscription plan already exists",
        });
      }

      await SubscriptionModel.create({
        planDetails: r.data.planDetails,
        cycle: r.data.cycle,
      });

      return res.status(201).json({
        success: true,
        data: "created subscription",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "internal server error",
      });
    }
  };

  getSubscriptions = async (req: Request, res: Response) => {
    try {
      const subscription = await SubscriptionModel.find({}).exec();
      res.status(200).json({
        success: true,
        data: subscription || [],
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: "internal server error",
      });
    }
  };

  updateSubscription = async (req: Request, res: Response) => {
    const schema = z.object({
      type: z.number().optional(),
      price: z.number().optional(),
      cycle: z.string().optional(),
      description: z.string().optional(),
    });

    const paramsSchema = z.object({
      id: z.string().optional(),
    });

    const r = schema.safeParse(req.body);
    const r1 = paramsSchema.safeParse(req.params);

    if (!r1.success) {
      return res.status(400).json({
        success: false,
        error: r1.error,
      });
    }

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const exists = await SubscriptionModel.findById({
        _id: r1.data.id,
      }).exec();
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: "subscription not found",
        });
      }

      const updatedSubscription = await SubscriptionModel.findByIdAndUpdate(
        {
          _id: r1.data.id,
        },
        {
          "planDetails.price": r.data.price,
          "planDetails.type": r.data.type,
          cycle: r.data.cycle,
          description: r.data.description,
        }
      ).exec();

      res.status(200).json({
        success: true,
        data: updatedSubscription,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: "internal server error",
      });
    }
  };

  deleteSubscription = async (req: Request, res: Response) => {
    const r = z
      .object({ id: z.string({ required_error: "provide subscription id" }) })
      .safeParse(req.params);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const exists = await SubscriptionModel.findById({
        _id: r.data.id,
      }).exec();
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: "subscription not found",
        });
      }

      await SubscriptionModel.findByIdAndDelete({ _id: r.data.id }).exec();

      res.status(200).json({
        success: true,
        data: "subscription deleted successfully",
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  private makeRequest = (options: any, data: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        res.on("end", () => {
          resolve(responseData);
        });
      });
      req.on("error", (error) => {
        reject(error);
      });
      req.write(data);
      req.end();
    });
  };

  private iniPayment = (data: any): Promise<string> => {
    this.options.path = "/transaction/initialize";
    this.options.method = "POST";
    return this.makeRequest(this.options, data);
  };

  private initVerification = (reference: string): Promise<string> => {
    this.options.path = `/transaction/verify/${reference}`;
    this.options.method = "GET";
    return this.makeRequest(this.options, "");
  };

  verifyPayment = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const r = z
      .object({
        reference: z.string(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }
    const data = r.data;
    try {
      const verificationResponse: string = await this.initVerification(
        data.reference
      );

      if (verificationResponse.includes("success")) {
        await UserSubscriptionModel.findOneAndUpdate(
          { userId: user.id },
          { status: STATUS.ACTIVE }
        );
      }
      res.status(200).json({
        success: true,
        data: JSON.parse(verificationResponse),
      });
    } catch (error) {
      console.error("Error during payment verification:", error);
    }
  };

  private payment = async (email: string, amount: number, res: any) => {
    const data = JSON.stringify({
      email: email,
      amount: amount,
    });
    try {
      const paymentResponse: string = await this.iniPayment(data);
      const encodedResponse: any = JSON.parse(paymentResponse);

      return {
        success: true,
        data: {
          authorization_url: encodedResponse["data"]["authorization_url"],
          message: encodedResponse["message"],
          access_code: encodedResponse["data"]["access_code"],
          reference: encodedResponse["data"]["reference"],
        },
      };
    } catch (e) {
      console.error(e);
      res.status(500).json({
        success: false,
        error: "internal server error",
      });
    }
  };

  subscribe = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const session = await mongoose.startSession();
    session.startTransaction();
    const r = z
      .object({
        subscriptionId: z.string(),
        email: z.string(),
        startDate: z.string(),
        autoRenew: z.boolean(),
      })
      .safeParse(req.body);

    if (!r.success)
      return res.status(400).json({ success: false, error: r.error });

    const data = r.data;

    try {
      // const subsExists = await UserSubscriptionModel.findOne({
      //   userId: data.userId,
      // }).exec();

      // if (subsExists)
      //   return res.status(400).json({
      //     success: false,
      //     error: "you already have an active subscription",
      //   });

      const subscription = await SubscriptionModel.findById({
        _id: data.subscriptionId,
      }).exec();

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found",
        });
      }

      const startDate = data.startDate;
      const cycle = subscription.cycle;

      let endDate;

      if (cycle === CYCLE.MONTHLY) {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await UserSubscriptionModel.create({
        subscriptionId: data.subscriptionId,
        userId: user.id,
        startDate: data.startDate,
        endDate: endDate,
      });

      try {
        const resp = await this.payment(
          data.email,
          Number.parseInt(subscription.planDetails.price.toString()),
          res
        );

        res.status(201).json(resp);
      } catch (e) {
        res.status(500).json({ success: false, error: e });
      }

      session.commitTransaction();
      session.endSession();
    } catch (e) {
      session.abortTransaction();
      session.endSession();
      res.status(500).json({
        success: false,
        error: "internal server error",
      });
    }
  };
}
