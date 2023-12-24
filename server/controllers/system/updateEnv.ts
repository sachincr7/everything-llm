import { Request, Response } from "express";
import { multiUserMode, userFromSession } from "../../utils/http";
import { dumpENV, updateENV } from "../../utils/helpers/updateENV";
import { users } from "@prisma/client";

export const updateEnv = async (request: Request, response: Response) => {
  try {
    const body = request.body;

    // Only admins can update the ENV settings.
    if (multiUserMode(response)) {
      const user: users | null = await userFromSession(request, response);
      if (!user || user?.role !== 'admin') {
        response.sendStatus(401).end();
        return;
      }
    }

    const { newValues, error } = updateENV(body, true);
    if (process.env.NODE_ENV === 'production') await dumpENV();
    response.status(200).json({ newValues, error });
  } catch (e: any) {
    console.log(e.message, e);
    response.sendStatus(500).end();
  }
}