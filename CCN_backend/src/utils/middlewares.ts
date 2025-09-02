// auth.middleware.ts
import type { Socket } from "socket.io";
import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../controllers/base";

class Middleware extends BaseController {
  socket = (socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.headers.authorization;
    if (!token) {
      next(new Error("Authentication failed"));
      return;
    }
    try {
      const data = this.verifyToken(token);
      socket.data.user = data;
      next();
    } catch (err) {
      console.error("Socket authentication failed:", err);
      next(new Error("Authentication failed"));
    }
  };

  auth = (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
      return res.status(401).json({ error: "unauthorized" });
    }
    try {
      const data = this.verifyToken(bearer);
      //@ts-ignore
      req.user = data;
      next();
    } catch (err) {
      console.error("Socket authentication failed:", err);
      return res.status(500).json({ error: err });
    }
  };

  authRole =
    (roles: Array<string> = []) =>
    (req: Request, res: Response, next: NextFunction) => {
      const user = this.getUser(req);
      if (!user || !roles.includes(user?.role)) {
        return res.status(401).json({
          success: false,
          error: "unauthorized",
        });
      }
      next();
    };
}

export default new Middleware();