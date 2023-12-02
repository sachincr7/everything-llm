import { Request, Response, Router } from 'express';
import { UserModel } from '../models/user';
import { validatedRequest } from '../utils/middleware/validatedRequest';
import { isAdmin, reqBody, userFromSession } from '../utils/http';

function adminEndpoints(app: Router) {
  if (!app) return;

  // Create a user
  app.post('/admin/users/new', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      if (!user || user?.role !== 'admin') {
        response.sendStatus(401).end();
        return;
      }

      const newUserParams = reqBody(request);

      const userExists = await UserModel.get({
        username: newUserParams.username,
      });

      if (userExists) {
        response.status(400).json({
          message: 'User already exists',
        });
        return;
      }

      const { user: newUser, error } = await UserModel.create(newUserParams);
      response.status(200).json({ user: newUser, error });
    } catch (e) {
      console.error(e);
      response.sendStatus(500).end();
    }
  });

  // Get all users
  app.get('/admin/users', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      if (!isAdmin(user)) {
        response.sendStatus(401).end();
        return;
      }

      const users = (
        await UserModel.where({
          deletedAt: null,
        })
      ).map((user: any) => {
        const { password, ...rest } = user;
        return rest;
      });
      response.status(200).json({ users });
    } catch (e) {
      console.error(e);
      response.sendStatus(500).end();
    }
  });

  // Update a user
  app.put('/admin/user/:id', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      if (!isAdmin(user)) {
        response.sendStatus(401).end();
        return;
      }

      const { id } = request.params;

      const userExists = await UserModel.get({
        id: parseInt(id),
        deletedAt: null,
      });
      if (!userExists) {
        response.status(400).json({
          message: 'User does not exists',
        });
        return;
      }

      const { username } = reqBody(request);
      const { success, error } = await UserModel.update(id, {
        username,
      });
      response.status(200).json({ success, error });
    } catch (e) {
      console.error(e);
      response.sendStatus(500).end();
    }
  });

  // Soft Delete a user 
  app.delete('/admin/user/:id', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const user = await userFromSession(request, response);
      if (!isAdmin(user)) {
        response.sendStatus(401).end();
        return;
      }

      const { id } = request.params;
      const { success, error } = await UserModel.delete(id, user.id);
      response.status(200).json({ success, error });
    } catch (error) {
      console.error(error);
      response.sendStatus(500).end();
    }
  });
}

export { adminEndpoints };
