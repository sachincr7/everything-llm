import { NextFunction, Request, Response } from 'express';
import { SystemSettings } from '../../models/systemSettings';
import { UserModel } from '../../models/user';
import { decodeJWT, getAuthToken } from '../http';

async function validatedRequest(request: Request, response: Response, next: NextFunction) {
  const multiUserMode = await SystemSettings.isMultiUserMode();
  response.locals.multiUserMode = multiUserMode;
  if (multiUserMode) return await validateMultiUserRequest(request, response, next);

  // When in development passthrough auth token for ease of development.
  // Or if the user simply did not set an Auth token or JWT Secret
  if (process.env.NODE_ENV === 'development' || !process.env.AUTH_TOKEN || !process.env.JWT_SECRET) {
    next();
    return;
  }

  if (!process.env.AUTH_TOKEN) {
    response.status(403).json({
      error: 'You need to set an AUTH_TOKEN environment variable.',
    });
    return;
  }
  const token = getAuthToken(request);

  if (!token) {
    response.status(403).json({
      error: 'No auth token found.',
    });
    return;
  }
  const { p } = decodeJWT(token) as { p: string };
  if (p !== process.env.AUTH_TOKEN) {
    response.status(403).json({
      error: 'Invalid auth token found.',
    });
    return;
  }

  next();
}

async function validateMultiUserRequest(request: Request, response: Response, next: NextFunction) {
  const token = getAuthToken(request);

  if (!token) {
    response.status(403).json({
      error: 'No auth token found.',
    });
    return;
  }

  const valid: any = decodeJWT(token);

  if (!valid || !valid.id) {
    response.status(403).json({
      error: 'Invalid auth token.',
    });
    return;
  }

  const user = await UserModel.get({ id: valid.id });
  if (!user) {
    response.status(403).json({
      error: 'Invalid auth for user.',
    });
    return;
  }

  response.locals.user = user;
  next();
}

export { validatedRequest };
