import { IRouter, Router } from "express";
import { MeetingController } from "../controllers/meetingController";

export class MeetingRouter extends MeetingController {
  router: IRouter

  constructor(){
    super();
    this.router = Router();
    this.initRoute()
  }

  initRoute = () => {
    this.router.post("/meeting/create-meeting", this.createMeeting);
  }
}