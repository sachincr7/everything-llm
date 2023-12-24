import { Request, Response } from "express";
import { multiUserMode, userFromSession } from "../../utils/http";

export const checkToken = async (request: Request, response: Response) => {
  try {
    if (multiUserMode(response)) {
      const user = await userFromSession(request, response);
      if (!user || user.suspended) {
        response.sendStatus(403).end();
        return;
      }

      response.sendStatus(200).end();
      return;
    }

    response.sendStatus(200).end();
  } catch (e: any) {
    console.log(e.message, e);
    response.sendStatus(500).end();
  }
}