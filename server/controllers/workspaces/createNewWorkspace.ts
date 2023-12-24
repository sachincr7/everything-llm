import { Request, Response } from "express";
import { reqBody, userFromSession } from "../../utils/http";
import { Workspace } from "../../models/workspaces";

interface CreateNewWorkspaceRequestBody extends Request {
  body: {
    name: string;
    onboardingComplete: boolean;
  };
}

export const createNewWorkspace = async (request: CreateNewWorkspaceRequestBody, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    const { name, onboardingComplete = false } = request.body;
    const { workspace, message } = await Workspace.new(name, user?.id);

    response.status(200).json({ workspace, message });
  } catch (error: any) {
    console.log(error.message, error);
    response.sendStatus(500).end();
  }
}