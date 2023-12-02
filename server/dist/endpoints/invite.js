"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const invite_1 = require("../models/invite");
const http_1 = require("../utils/http");
const user_1 = require("../models/user");
function inviteEndpoints(app) {
    if (!app)
        return;
    app.get("/invite/:code", (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { code } = request.params;
            const invite = yield invite_1.InviteModel.get({ code });
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
        }
        catch (e) {
            console.error(e);
            response.sendStatus(500).end();
        }
    }));
    app.post("/invite/:code", (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { code } = request.params;
            const userParams = (0, http_1.reqBody)(request);
            const invite = yield invite_1.InviteModel.get({ code });
            if (!invite || invite.status !== "pending") {
                response
                    .status(200)
                    .json({ success: false, error: "Invite not found or is invalid." });
                return;
            }
            const { user, error } = yield user_1.UserModel.create(userParams);
            if (!user) {
                console.error("Accepting invite:", error);
                response
                    .status(200)
                    .json({ success: false, error: "Could not create user." });
                return;
            }
            yield invite_1.InviteModel.markClaimed(invite.id, user);
            response.status(200).json({ success: true, error: null });
        }
        catch (e) {
            console.error(e);
            response.sendStatus(500).end();
        }
    }));
}
module.exports = { inviteEndpoints };
