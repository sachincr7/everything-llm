import { Request, Response } from 'express';
import { userFromSession } from '../../utils/http';
import { UserModel } from '../../models/user';

export const archiveUser = async (request: Request, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user || user?.role !== 'admin') {
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
};
