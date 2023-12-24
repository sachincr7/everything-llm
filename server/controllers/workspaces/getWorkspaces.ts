import { Request, Response } from "express";
import { multiUserMode, userFromSession } from "../../utils/http";
import { Workspace } from "../../models/workspaces";

export const getWorkspaces = async (request: Request, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user) {
      response.sendStatus(400).end();
      return;
    }

    const workspaces = multiUserMode(response) ? await Workspace.whereWithUser(user) : await Workspace.where();

    response.status(200).json({ workspaces });
  } catch (e: any) {
    console.log(e.message, e);
    response.sendStatus(500).end();
  }
}