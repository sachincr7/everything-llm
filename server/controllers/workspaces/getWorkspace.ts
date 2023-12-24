import { Request, Response } from "express";
import { multiUserMode, userFromSession } from "../../utils/http";
import { Workspace } from "../../models/workspaces";

interface GetWorkspaceRequestBody extends Request {
  params: {
    slug: string;
  };
}

export const GetWorkspace = async (request: GetWorkspaceRequestBody, response: Response) => {
  try {
    const { slug } = request.params;
    const user = await userFromSession(request, response);
    if (!user) {
      response.sendStatus(400).end();
      return;
    }

    const workspace = multiUserMode(response) ? await Workspace.getWithUser(user, { slug }) : await Workspace.get({ slug });

    response.status(200).json({ workspace });
  } catch (e: any) {
    console.log(e.message, e);
    response.sendStatus(500).end();
  }
}