import { Request, Response } from "express";
import { userFromSession } from "../../utils/http";
import { UserModel } from "../../models/user";

interface CreateUserRequestWithBody extends Request {
  body: {
    username: string;
    password: string;
    role: string;
  };
}

export const createUser = async (request: CreateUserRequestWithBody, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user || user?.role !== 'admin') {
      response.sendStatus(401).end();
      return;
    }

    const { username, password, role = 'default' } = request.body;

    const userExists = await UserModel.get({
      username,
    });

    if (userExists) {
      response.status(400).json({
        message: 'User already exists',
      });
      return;
    }

    const { user: newUser, error } = await UserModel.create({
      username,
      password,
      role,
    });
    response.status(200).json({ user: newUser, error });
  } catch (e) {
    console.error(e);
    response.sendStatus(500).end();
  }
}