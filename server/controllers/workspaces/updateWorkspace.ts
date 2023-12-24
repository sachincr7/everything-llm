import { Request, Response } from 'express';
import { multiUserMode, userFromSession } from '../../utils/http';
import { Workspace } from '../../models/workspaces';

interface UpdateWorkspaceRequestBody extends Request {
  body: Object;
  params: {
    slug: string;
  };
}

export const updateWorkspace = async (request: UpdateWorkspaceRequestBody, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user) {
      response.sendStatus(400).end();
      return;
    }

    const { slug } = request.params;
    const data = request.body;
    const currentWorkspace = multiUserMode(response) ? await Workspace.getWithUser(user, { slug }) : await Workspace.get({ slug });

    if (!currentWorkspace) {
      response.sendStatus(400).end();
      return;
    }

    const { workspace, message } = await Workspace.update(currentWorkspace.id, data);
    response.status(200).json({ workspace, message });
  } catch (e: any) {
    console.log(e.message, e);
    response.sendStatus(500).end();
  }
};
