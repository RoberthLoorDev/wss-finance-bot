import { Request, Response } from "express";

export class PingController {
     public ping = (req: Request, res: Response) => {
          res.json({
               message: "Pong 🏓 operation successful",
               timeStamp: new Date().toISOString(),
          });
     };
}
