import { Request, Response, Router } from 'express';
import { validatedRequest } from '../utils/middleware/validatedRequest';
import { multiUserMode, reqBody, userFromSession } from '../utils/http';
import { Workspace } from '../models/workspaces';
import { Document } from '../models/documents';

export const workspaceEndpoints = (app: Router) => {
  if (!app) return;

  app.post('/workspace/new', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      const { name = null, onboardingComplete = false } = reqBody(request);
      const { workspace, message } = await Workspace.new(name, user?.id);

      response.status(200).json({ workspace, message });
    } catch (error: any) {
      console.log(error.message, error);
      response.sendStatus(500).end();
    }
  });

  app.put('/workspace/:slug/update', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      const { slug = null } = request.params;
      const data = reqBody(request);
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
  });

  app.get('/workspaces', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      const workspaces = multiUserMode(response) ? await Workspace.whereWithUser(user) : await Workspace.where();

      response.status(200).json({ workspaces });
    } catch (e: any) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get('/workspace/:slug', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const { slug } = request.params;
      const user = await userFromSession(request, response);
      const workspace = multiUserMode(response) ? await Workspace.getWithUser(user, { slug }) : await Workspace.get({ slug });

      response.status(200).json({ workspace });
    } catch (e: any) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post('/workspace/:slug/update-embeddings', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      const { slug = null } = request.params;
      const { adds = [], deletes = [] } = reqBody(request);
      const currWorkspace = multiUserMode(response) ? await Workspace.getWithUser(user, { slug }) : await Workspace.get({ slug });

      if (!currWorkspace) {
        response.sendStatus(400).end();
        return;
      }

      const data = (await Document.addDocuments(currWorkspace, adds)) as {
        failed: string[];
        embedded: string[];
      };

      response.status(200).json({
        data,
      });
    } catch (e: any) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });
};
