import { Request, Response } from "express";
import { BaseController } from "./base";
import z from "zod";
import { STATUS, User } from "../models/userModel";

export class AdminController extends BaseController {
  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await User.find().select(
        "-password -pin -createdAt -updatedAt -__v"
      );
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  verifyAccount = async (req: Request, res: Response) => {
    const r = z
      .object({
        userId: z.string({ required_error: "user id is required" }),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }
    try {
      await User.findByIdAndUpdate(
        { _id: r.data.userId },
        { status: STATUS.VERIFIED }
      ).exec();

      res.status(200).json({
        success: true,
        data: "account verified",
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  suspendAccount = async (req: Request, res: Response) => {
    const r = z
      .object({
        userId: z.string({ required_error: "user id is required" }),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }
    try {
      await User.findByIdAndUpdate(
        { _id: r.data.userId },
        { status: STATUS.SUSPENDED }
      ).exec();

      res.status(200).json({
        success: true,
        data: "account suspended",
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };
}
