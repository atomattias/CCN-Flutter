import { User } from "../models/userModel";
import type { Socket } from "socket.io";
import { sign, verify } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET_KEY, PASS, USER } from "../utils/secret";
import { Transporter, createTransport } from "nodemailer";
import crypto from "crypto";

type Config = {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
};
export class BaseController {
  validRoles: Array<string | undefined> = ["ADMIN", "CLINICIAN", "SUPERUSER"];
  transporter: Transporter;
  config: Config;

  constructor() {
    this.config = {
      service: "gmail", //email service provider
      auth: {
        user: USER, // email address
        pass: PASS, //email password or app password
      },
    };
    this.transporter = createTransport(this.config);
  }

  getSocketUser(socket: Socket): User {
    return socket.data.user;
  }

  getUser(req: any) {
    return req.user as { id: string; email: string; role: string };
  }

  getIoUser(io: Socket) {
    return io.data.user as { id: string; fullname: string ; email: string};
  }

  genToken(data: any) {
    return sign(data, SECRET_KEY!, { algorithm: "HS256", expiresIn: "1d" });
  }

  verifyToken(token: string): any {
    const tk = token.slice("Bearer ".length);

    const jwt = verify(tk, SECRET_KEY!);
    return jwt;
  }

  hash(data: string): string {
    return bcrypt.hashSync(data, 10);
  }

  compareHash(hash: string, data: string): boolean {
    return bcrypt.compareSync(data, hash);
  }

  generateOTP = () => {
    const otp = Math.floor(100000 + crypto.randomInt(900000));
    return otp.toString();
  };

  sendEmail = async (to: string, subject: string, text: string) => {
    try {
      const message = {
        from: this.config.auth.user,
        to,
        subject,
        text,
      };

      // Send the email
      const info = await this.transporter.sendMail(message);

      console.log("Email successfully sent: ", info.response);
    } catch (error) {
      console.error("Error sending email: ", error);
    }
  };
}
