import { Request, Response } from 'express';
import { userFromSession } from '../../utils/http';
import { UserModel } from '../../models/user';

interface UpdateUserRequestBody extends Request {
  body: {
    username: string;
  };
}

export const updateUser = async (request: UpdateUserRequestBody, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user || user?.role !== 'admin') {
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

    const { username } = request.body;
    const { success, error } = await UserModel.update(id, {
      username,
    });
    response.status(200).json({ success, error });
  } catch (e) {
    console.error(e);
    response.sendStatus(500).end();
  }
};
