import type { Request, Response } from "express";
import { BaseController } from "./base";
import { User } from "../models/userModel";
import z from "zod";

export class UserController extends BaseController {
  updateDetails = async (req: Request, res: Response) => {
    const r = z
      .object({
        id: z.string({
          required_error: "user id is required",
        }),
        fullname: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        profilePicture: z.string().optional(),
      })
      .safeParse(req.body);
  
    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const user = await User.findOne({ _id: r.data.id });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: "user not found",
        });
      }

      const updateUserDetails = {
        fullname: r.data.fullname,
        email: r.data.email,
        address: r.data.address,
        country: r.data.country,
        phone: r.data.phone,
        profilePicture: r.data.profilePicture,
      };

      const updateUser = await User.findByIdAndUpdate(
        user.id,
        updateUserDetails,
        { new: true }
      );

      if (!updateUser) {
        return res.status(404).json({
          success: false,
          error: "Failed to update user details",
        });
      }

      res.status(200).json({ success: true, data: "Update successfully done" });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const r = z
      .object({
        oldPassword: z.string(),
        newPassword: z.string(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const existingUser = await User.findById({ _id: user.id });

      if (!existingUser) {
        return res.json({
          success: false,
          error: "User not found",
        });
      }

      const validPassword = this.compareHash(
        existingUser.password,
        r.data.oldPassword
      );

      if (!validPassword) {
        return res.json({
          success: false,
          error: "Password does not match",
        });
      }

      await User.findByIdAndUpdate(
        { _id: user.id },
        { password: this.hash(r.data.newPassword) }
      );

      res.status(200).json({
        success: true,
        data: "password updated",
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };
}
