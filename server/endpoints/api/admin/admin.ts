import { UserModel } from '../../../models/user';
import { Request, Response, Router } from 'express';
import { multiUserMode, reqBody } from '../../../utils/http';
import { validApiKey } from '../../../utils/middleware/validApiKey';

function apiAdminEndpoints(app: Router) {
  if (!app) return;

  app.post('/v1/admin/users/new', [validApiKey], async (request: Request, response: Response) => {
    try {
      if (!multiUserMode(response)) {
        response.sendStatus(401).end();
        return;
      }

      const newUserParams = reqBody(request);
      const { user: newUser, error } = await UserModel.create(newUserParams);
      response.status(201).json({ user: newUser, error });
    } catch (e) {
      console.error(e);
      response.sendStatus(500).end();
    }
  });

  app.put("/v1/admin/users/:id", [validApiKey], async (request: Request, response: Response) => {
    try {
      if (!multiUserMode(response)) {
        response.sendStatus(401).end();
        return;
      }

      const { id } = request.params;
      const updates = reqBody(request);
      const { success, error } = await UserModel.update(id, updates);
      response.status(200).json({ success, error });
    } catch (error) {
      console.error(error);
      response.sendStatus(500).end();
    }
  });

  app.delete("/v1/admin/users/:id", [validApiKey], async (request: Request, response: Response) => {
    try {
      if (!multiUserMode(response)) {
        response.sendStatus(401).end();
        return;
      }

      const { id } = request.params;
      const { success, error } = await UserModel.delete(id);
      response.status(200).json({ success, error });
    } catch (error) {
      console.error(error);
      response.sendStatus(500).end();
    }
  });
}

export { apiAdminEndpoints };
