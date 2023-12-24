import { Request, Response } from "express";

export const pingSystem = (request: Request, response: Response) => {
  response.status(200).json({ online: true });
}