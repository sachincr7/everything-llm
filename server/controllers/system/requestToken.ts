import { Request, Response } from 'express';
import { SystemSettings } from '../../models/systemSettings';
import { UserModel } from '../../models/user';
import bcrypt from 'bcrypt';
import { makeJWT } from '../../utils/http';

interface requestTokenRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

export const requestToken = async (request: requestTokenRequest, response: Response) => {
  try {
    if (await SystemSettings.isMultiUserMode()) {
      const { username, password } = request.body;
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
      const { password } = request.body;
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
};
