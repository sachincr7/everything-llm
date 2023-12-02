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
exports.apiAdminEndpoints = void 0;
const user_1 = require("../../../models/user");
const http_1 = require("../../../utils/http");
const validApiKey_1 = require("../../../utils/middleware/validApiKey");
function apiAdminEndpoints(app) {
    if (!app)
        return;
    app.post('/v1/admin/users/new', [validApiKey_1.validApiKey], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, http_1.multiUserMode)(response)) {
                response.sendStatus(401).end();
                return;
            }
            const newUserParams = (0, http_1.reqBody)(request);
            const { user: newUser, error } = yield user_1.UserModel.create(newUserParams);
            response.status(201).json({ user: newUser, error });
        }
        catch (e) {
            console.error(e);
            response.sendStatus(500).end();
        }
    }));
    app.put("/v1/admin/users/:id", [validApiKey_1.validApiKey], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, http_1.multiUserMode)(response)) {
                response.sendStatus(401).end();
                return;
            }
            const { id } = request.params;
            const updates = (0, http_1.reqBody)(request);
            const { success, error } = yield user_1.UserModel.update(id, updates);
            response.status(200).json({ success, error });
        }
        catch (error) {
            console.error(error);
            response.sendStatus(500).end();
        }
    }));
    app.delete("/v1/admin/users/:id", [validApiKey_1.validApiKey], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, http_1.multiUserMode)(response)) {
                response.sendStatus(401).end();
                return;
            }
            const { id } = request.params;
            const { success, error } = yield user_1.UserModel.delete(id);
            response.status(200).json({ success, error });
        }
        catch (error) {
            console.error(error);
            response.sendStatus(500).end();
        }
    }));
}
exports.apiAdminEndpoints = apiAdminEndpoints;
