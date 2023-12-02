import { Request, Response, Router } from "express";
import { InviteModel } from "../models/invite";
import { reqBody } from "../utils/http";
import { UserModel } from "../models/user";
import { invites } from "@prisma/client";

function inviteEndpoints(app: Router) {
  if (!app) return;

  app.get("/invite/:code", async (request: Request, response: Response) => {
    try {
      const { code } = request.params;
      const invite = await InviteModel.get({ code });
      if (!invite) {
        response.status(200).json({ invite: null, error: "Invite not found." });
        return;
      }

      if (invite.status !== "pending") {
        response
          .status(200)
          .json({ invite: null, error: "Invite is no longer valid." });
        return;
      }

      response
        .status(200)
        .json({ invite: { code, status: invite.status }, error: null });
    } catch (e) {
      console.error(e);
      response.sendStatus(500).end();
    }
  });

  app.post("/invite/:code", async (request, response) => {
    try {
      const { code } = request.params;
      const userParams = reqBody(request);
      const invite: invites | null = await InviteModel.get({ code });
      if (!invite || invite.status !== "pending") {
        response
          .status(200)
          .json({ success: false, error: "Invite not found or is invalid." });
        return;
      }

      const { user, error } = await UserModel.create(userParams);
      if (!user) {
        console.error("Accepting invite:", error);
        response
          .status(200)
          .json({ success: false, error: "Could not create user." });
        return;
      }

      await InviteModel.markClaimed(invite.id, user);
      response.status(200).json({ success: true, error: null });
    } catch (e) {
      console.error(e);
      response.sendStatus(500).end();
    }
  });
}

module.exports = { inviteEndpoints };
