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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminEndpoints = void 0;
const user_1 = require("../models/user");
const validatedRequest_1 = require("../utils/middleware/validatedRequest");
const http_1 = require("../utils/http");
function adminEndpoints(app) {
    if (!app)
        return;
    // Create a user
    app.post('/admin/users/new', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!user || (user === null || user === void 0 ? void 0 : user.role) !== 'admin') {
                response.sendStatus(401).end();
                return;
            }
            const newUserParams = (0, http_1.reqBody)(request);
            const userExists = yield user_1.UserModel.get({
                username: newUserParams.username,
            });
            if (userExists) {
                response.status(400).json({
                    message: 'User already exists',
                });
                return;
            }
            const { user: newUser, error } = yield user_1.UserModel.create(newUserParams);
            response.status(200).json({ user: newUser, error });
        }
        catch (e) {
            console.error(e);
            response.sendStatus(500).end();
        }
    }));
    // Get all users
    app.get('/admin/users', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!(0, http_1.isAdmin)(user)) {
                response.sendStatus(401).end();
                return;
            }
            const users = (yield user_1.UserModel.where({
                deletedAt: null,
            })).map((user) => {
                const { password } = user, rest = __rest(user, ["password"]);
                return rest;
            });
            response.status(200).json({ users });
        }
        catch (e) {
            console.error(e);
            response.sendStatus(500).end();
        }
    }));
    // Update a user
    app.put('/admin/user/:id', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!(0, http_1.isAdmin)(user)) {
                response.sendStatus(401).end();
                return;
            }
            const { id } = request.params;
            const userExists = yield user_1.UserModel.get({
                id: parseInt(id),
                deletedAt: null,
            });
            if (!userExists) {
                response.status(400).json({
                    message: 'User does not exists',
                });
                return;
            }
            const { username } = (0, http_1.reqBody)(request);
            const { success, error } = yield user_1.UserModel.update(id, {
                username,
            });
            response.status(200).json({ success, error });
        }
        catch (e) {
            console.error(e);
            response.sendStatus(500).end();
        }
    }));
    // Soft Delete a user 
    app.delete('/admin/user/:id', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!(0, http_1.isAdmin)(user)) {
                response.sendStatus(401).end();
                return;
            }
            const { id } = request.params;
            const { success, error } = yield user_1.UserModel.delete(id, user.id);
            response.status(200).json({ success, error });
        }
        catch (error) {
            console.error(error);
            response.sendStatus(500).end();
        }
    }));
}
exports.adminEndpoints = adminEndpoints;
