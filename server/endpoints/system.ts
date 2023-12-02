import { Request, Response, Router } from 'express';
import { SystemSettings } from '../models/systemSettings';
import { makeJWT, multiUserMode, reqBody, userFromSession } from '../utils/http';
import { UserModel } from '../models/user';
import bcrypt from 'bcrypt';
import { validatedRequest } from '../utils/middleware/validatedRequest';
import { dumpENV, updateENV } from '../utils/helpers/updateENV';
import { users } from '@prisma/client';
import { v4 } from 'uuid';

export const systemEndpoints = (app: Router) => {
  if (!app) return;

  app.get('/ping', (_, response: Response) => {
    response.status(200).json({ online: true });
  });

  app.get('/setup-complete', async (_, response) => {
    try {
      const results = await SystemSettings.currentSettings();
      response.status(200).json({ results });
    } catch (error: any) {
      console.log(error.message, error);
      response.sendStatus(500).end();
    }
  });

  app.post('/request-token', async (request: Request, response: Response) => {
    try {
      if (await SystemSettings.isMultiUserMode()) {
        const { username, password } = reqBody(request);
        const existingUser = await UserModel.get({ username });

        if (!existingUser) {
          response.status(200).json({
            user: null,
            valid: false,
            token: null,
            message: '[001] Invalid login credentials.',
          });
          return;
        }

        if (!bcrypt.compareSync(password, existingUser.password)) {
          response.status(200).json({
            user: null,
            valid: false,
            token: null,
            message: '[002] Invalid login credentials.',
          });
          return;
        }

        if (existingUser.suspended) {
          response.status(200).json({
            user: null,
            valid: false,
            token: null,
            message: '[004] Account suspended by admin.',
          });
          return;
        }

        response.status(200).json({
          valid: true,
          user: existingUser,
          token: makeJWT({ id: existingUser.id, username: existingUser.username }, '30d'),
          message: null,
        });
        return;
      } else {
        const { password } = reqBody(request);
        if (password !== process.env.AUTH_TOKEN) {
          response.status(401).json({
            valid: false,
            token: null,
            message: '[003] Invalid password provided',
          });
          return;
        }

        response.status(200).json({
          valid: true,
          token: makeJWT({ p: password }, '30d'),
          message: null,
        });
      }
    } catch (error: any) {
      console.log(error.message, error);
      response.sendStatus(500).end();
    }
  });

  app.post('/system/update-password', [validatedRequest], async (request: Request, response: Response) => {
    try {
      // Cannot update password in multi - user mode.
      if (multiUserMode(response)) {
        response.sendStatus(401).end();
        return;
      }

      const { usePassword, newPassword } = reqBody(request);
      const { error } = updateENV(
        {
          AuthToken: usePassword ? newPassword : '',
          JWTSecret: usePassword ? v4() : '',
        },
        true
      );
      if (process.env.NODE_ENV === 'production') await dumpENV();
      response.status(200).json({ success: !error, error });
    } catch (error: any) {
      console.log(error.message, error);
      response.sendStatus(500).end();
    }
  });

  app.get('/system/check-token', [validatedRequest], async (request: Request, response: Response) => {
    try {
      if (multiUserMode(response)) {
        const user = await userFromSession(request, response);
        if (!user || user.suspended) {
          response.sendStatus(403).end();
          return;
        }

        response.sendStatus(200).end();
        return;
      }

      response.sendStatus(200).end();
    } catch (e: any) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post('/system/update-env', [validatedRequest], async (request: Request, response: Response) => {
    try {
      const body = reqBody(request);

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
  });
};
