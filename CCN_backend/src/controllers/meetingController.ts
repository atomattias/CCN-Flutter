import { BaseController } from "./base";
import { NextFunction, Request, Response } from "express";

export class MeetingController extends BaseController{
  // create meeting
  createMeeting = async(req: Request, res: Response, next: NextFunction) => {}
  joinMeeting = async() => {}
}