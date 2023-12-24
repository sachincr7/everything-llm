import { Request, Response } from "express";
import { userFromSession } from "../../utils/http";
import { UserModel } from "../../models/user";
import { users } from "@prisma/client";

export const getUsers = async (request: Request, response: Response) => {
  try {
    const user = await userFromSession(request, response);
    if (!user || user?.role !== 'admin') {
      response.sendStatus(401).end();
      return;
    }

    const users = (
      await UserModel.where({
        deletedAt: null,
      })
    ).map((user: users) => {
      console.log(user.id)
      const { password, ...rest } = user;
      return rest;
    });
    response.status(200).json({ users });
  } catch (e) {
    console.error(e);
    response.sendStatus(500).end();
  }
}