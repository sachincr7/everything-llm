import { Request, Response } from 'express';
import { multiUserMode, userFromSession } from '../../utils/http';
import { Document } from '../../models/documents';
import { Workspace } from '../../models/workspaces';

interface UpdateEmbeddingsRequestBody extends Request {
  body: {
    adds: string[];
    deletes: string[];
  };
}

const updateEmbeddings = async (request: UpdateEmbeddingsRequestBody, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user) {
      response.sendStatus(400).end();
      return;
    }

    const { slug = null } = request.params;
    const { adds = [], deletes = [] } = request.body;
    const currWorkspace = multiUserMode(response) ? await Workspace.getWithUser(user, { slug }) : await Workspace.get({ slug });

    if (!currWorkspace) {
      response.sendStatus(400).end();
      return;
    }

    const data = await Document.addDocuments(currWorkspace, adds, deletes);

    response.status(200).json({
      data,
    });
  } catch (e: any) {
    console.log(e.message, e);
    response.sendStatus(500).end();
  }
};

export { updateEmbeddings };
