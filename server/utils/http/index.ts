import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { UserModel } from '../../models/user';
import { users } from '@prisma/client';

function reqBody(request: Request) {
  return typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
}

function queryParams(request: Request) {
  return request.query;
}

function multiUserMode(response: Response) {
  return response?.locals?.multiUserMode;
}

function decodeJWT(jwtToken: string) {
  try {
    return JWT.verify(jwtToken, process.env.JWT_SECRET!);
  } catch (error: any) {
    console.log(error);
  }
  return { p: null, id: null, username: null };
}

const userFromSession = async (request: Request, response: Response | null = null): Promise<users | null> => {
  if (!!response && !!response.locals?.user) {
    return response.locals.user;
  }

  const token = getAuthToken(request);

  if (!token) {
    return null;
  }

  const valid = decodeJWT(token) as {
    id: string;
  };

  if (!valid || !valid.id) {
    return null;
  }

  const user = await UserModel.get({ id: valid.id });
  return user;
}

function getAuthToken(request: Request) {
  const auth = request.header('Authorization');
  return auth ? auth.split(' ')[1] : null;
}

function makeJWT(info = {}, expiry = '30d') {
  console.log('info', info);
  if (!process.env.JWT_SECRET) throw new Error('Cannot create JWT as JWT_SECRET is unset.');
  return JWT.sign(info, process.env.JWT_SECRET, { expiresIn: expiry });
}

const isAdmin = (user: users | null): Boolean => (user?.role === 'admin') ?? false;

export { reqBody, multiUserMode, decodeJWT, userFromSession, getAuthToken, makeJWT, queryParams, isAdmin };
