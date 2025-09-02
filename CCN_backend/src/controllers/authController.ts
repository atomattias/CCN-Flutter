import type { Request, Response } from "express";
import { BaseController } from "./base";
import { STATUS, User, verifyEmailModel } from "../models/userModel";
import z from "zod";

export class AuthController extends BaseController {
 
  signIn = async (req: Request, res: Response) => {
    const r = z
      .object({
        email: z
          .string({
            required_error: "email is required",
          })
          .email(),
        // .regex(emailRegEx),
        password: z
          .string()
          .min(8, { message: "must be at least 8 characters long" })
          .optional(),
        // .regex(passwordRegEx),
      })
      .safeParse(req.body);

    const q = z
      .object({
        pin: z.string().optional(),
      })
      .safeParse(req.query);

    // check if credentials have been passed
    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    if (!q.success) {
      return res.status(400).json({
        success: false,
        error: q.error,
      });
    }

    try {
      var user = await User.findOne({ email: r.data.email }).exec();

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // validate password
      const validPassword = this.compareHash(
        q.data.pin ? user.pin : user.password,
        r.data.password || q.data.pin || ""
      );

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          data: "invalid password or pin",
        });
      }

      const token = this.genToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const userData = {
        _id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token,
      };

      res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  /* what is this pin for ?
    if is for a user to create a pin for himself, get the userId from the token using the this.getUser(req)
  */
  createPin = async (req: Request, res: Response) => {
    const schema = z.object({
      userId: z.string(),
      pin: z.string(),
    });

    const r = schema.safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }
    try {
      await User.findByIdAndUpdate(
        { _id: r.data.userId },
        { pin: this.hash(r.data.pin) }
      );
      res.status(200).json({
        success: true,
        data: "pin created successfully",
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  sendOtp = async (req: Request, res: Response) => {
    const r = z
      .object({
        email: z
          .string({
            required_error: "email is required",
          })
          .email(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    const otpCode = this.generateOTP();

    try {
      const user = await User.findOne({ email: r.data.email }).exec();

      if (user) {
        return res
          .status(400)
          .json({ success: false, error: "User account already exists" });
      }

      const existingVerification = await verifyEmailModel
        .findOne({
          email: r.data.email,
        })
        .exec();

      if (existingVerification) {
        existingVerification.otpCode = this.hash(otpCode);
        await existingVerification.save();
      } else {
        await verifyEmailModel.create({
          email: r.data.email,
          otpCode: this.hash(otpCode),
        });
      }

      const subject = "Account Verification";
      const text = `Dear User,\n\nThank you for signing up with CCN. To complete the account verification process, please use the following code:\n\n${otpCode}\n\nIf you did not initiate this request, please disregard this message.\n\nBest regards,\nCCN Team`;
      await this.sendEmail(r.data.email, subject, text);

      res.status(200).json({
        success: true,
        data: `Verification code sent to ${r.data.email}`,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  // I'm confused about this endpoint.
  createAccount = async (req: Request, res: Response) => {
    const r = z
      .object({
        fullname: z.string({
          required_error: "name is required",
        }),
        email: z
          .string({
            required_error: "email is required",
          })
          .email(),
        password: z
          .string()
          .min(8, { message: "must be at least 8 characters long" }),
        role: z.optional(z.string()),
      })
      .refine(
        (data) => (data.role ? this.validRoles.includes(data.role) : true),
        {
          message: "roles should either be CLINICIAN, ADMIN or SUPERUSER",
        }
      )
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const existingUser = await User.findOne({
        email: r.data.email,
      }).exec();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          data: "User already exist",
        });
      }

      var verified = await verifyEmailModel
        .findOne({ email: r.data.email })
        .exec();

      // why would you verify email first before creating account ?
      if (!verified) {
        return res.status(400).json({
          success: false,
          error: "Please perform email verification first",
        });
      }

      if (!verified.isVerified) {
        return res.status(400).json({
          success: false,
          error: "Please verify your email",
        });
      }

      // save user to db
      await User.create({
        password: this.hash(r.data.password),
        email: r.data.email,
        fullname: r.data.fullname,
        role: r.data.role,
        status: STATUS.UNVERIFIED,
      });

      res.status(201).json({
        success: true,
        data: `Account created successfully`,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    const r = z
      .object({
        email: z.string(),
        otpCode: z.string(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    try {
      const verifyEmail = await verifyEmailModel.findOne({
        email: r.data.email,
      });

      if (!verifyEmail) {
        return res.status(404).json({
          success: false,
          error: "Not found",
        });
      }

      if (this.compareHash(verifyEmail.otpCode, r.data.otpCode)) {
        verifyEmail.isVerified = true;
        await verifyEmail.save();
        return res.status(200).json({
          success: true,
          data: "Email verification successful",
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "Invalid OTP code",
        });
      }
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const r = z.object({ email: z.string().email() }).safeParse(req.body);
    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }

    const otpCode = this.generateOTP();

    try {
      const user = await User.findOne({ email: r.data.email }).exec();

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "user not found",
        });
      }

      const existingVerification = await verifyEmailModel
        .findOne({
          email: r.data.email,
        })
        .exec();

      if (existingVerification) {
        existingVerification.otpCode = this.hash(otpCode);
        existingVerification.isVerified = false;
        await existingVerification.save();
      } else {
        await verifyEmailModel.create({
          isVerified: false,
          email: r.data.email,
          otpCode: this.hash(otpCode),
        });
      }

      // user.passwordResetToken = otpCode;
      // await user.save();

      // TODO: Send reset token to mail or phone
      const subject = "Password Reset Request";
      const text = `Dear User,\n\nWe received a request to reset your password. To proceed, please use the following code:\n\n${otpCode}\n\nIf you did not initiate this request, please disregard this message.\n\nThank you,\nCCN`; // Email body;
      await this.sendEmail(user.email, subject, text);

      res.status(200).json({
        success: true,
        data: "reset token sent",
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: e,
      });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const r = z
      .object({
        email: z.string(),
        password: z.string(),
      })
      .safeParse(req.body);

    if (!r.success) {
      return res.status(400).json({
        success: false,
        error: r.error,
      });
    }
    try {
      const existingVerification = await verifyEmailModel
        .findOne({
          email: r.data.email,
        })
        .exec();

      if (!existingVerification?.isVerified) {
        return res.status(400).json({
          success: false,
          error: "email not verified",
        });
      }

      await User.findOneAndUpdate({
        password: this.hash(r.data.password),
      });

      await verifyEmailModel.findByIdAndDelete({
        _id: existingVerification.id,
      });

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
