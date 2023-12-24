import { Request, Response } from "express";
import { SystemSettings } from "../../models/systemSettings";

export const setupComplete = async (request: Request, response: Response) => {
  try {
    const results = await SystemSettings.currentSettings();
    response.status(200).json({ results });
  } catch (error: any) {
    console.log(error.message, error);
    response.sendStatus(500).end();
  }
}