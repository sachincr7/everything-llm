import { NextFunction, Request, Response } from "express";
import { SystemSettings } from "../../models/systemSettings";
import ApiKeys from "../../models/apiKeys";

export async function validApiKey(request: Request, response: Response, next: NextFunction) {
  const multiUserMode = await SystemSettings.isMultiUserMode();
  response.locals.multiUserMode = multiUserMode;

  const auth = request.header("Authorization");
  const bearerKey = auth ? auth.split(" ")[1] : null;
  if (!bearerKey) {
    response.status(403).json({
      error: "No valid api key found.",
    });
    return;
  }

  if (!(await ApiKeys.get({ secret: bearerKey }))) {
    response.status(403).json({
      error: "No valid api key found.",
    });
    return;
  }

  next();
}