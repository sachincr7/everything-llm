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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemEndpoints = void 0;
const systemSettings_1 = require("../models/systemSettings");
const http_1 = require("../utils/http");
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validatedRequest_1 = require("../utils/middleware/validatedRequest");
const updateENV_1 = require("../utils/helpers/updateENV");
const uuid_1 = require("uuid");
const systemEndpoints = (app) => {
    if (!app)
        return;
    app.get('/ping', (_, response) => {
        response.status(200).json({ online: true });
    });
    app.get('/setup-complete', (_, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('yoo');
            const results = yield systemSettings_1.SystemSettings.currentSettings();
            response.status(200).json({ results });
        }
        catch (error) {
            console.log(error.message, error);
            response.sendStatus(500).end();
        }
    }));
    app.post('/request-token', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (yield systemSettings_1.SystemSettings.isMultiUserMode()) {
                const { username, password } = (0, http_1.reqBody)(request);
                const existingUser = yield user_1.UserModel.get({ username });
                if (!existingUser) {
                    response.status(200).json({
                        user: null,
                        valid: false,
                        token: null,
                        message: '[001] Invalid login credentials.',
                    });
                    return;
                }
                if (!bcrypt_1.default.compareSync(password, existingUser.password)) {
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
                    token: (0, http_1.makeJWT)({ id: existingUser.id, username: existingUser.username }, '30d'),
                    message: null,
                });
                return;
            }
            else {
                const { password } = (0, http_1.reqBody)(request);
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
                    token: (0, http_1.makeJWT)({ p: password }, '30d'),
                    message: null,
                });
            }
        }
        catch (error) {
            console.log(error.message, error);
            response.sendStatus(500).end();
        }
    }));
    app.post('/system/update-password', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Cannot update password in multi - user mode.
            if ((0, http_1.multiUserMode)(response)) {
                response.sendStatus(401).end();
                return;
            }
            const { usePassword, newPassword } = (0, http_1.reqBody)(request);
            const { error } = (0, updateENV_1.updateENV)({
                AuthToken: usePassword ? newPassword : '',
                JWTSecret: usePassword ? (0, uuid_1.v4)() : '',
            }, true);
            if (process.env.NODE_ENV === 'production')
                yield (0, updateENV_1.dumpENV)();
            response.status(200).json({ success: !error, error });
        }
        catch (error) {
            console.log(error.message, error);
            response.sendStatus(500).end();
        }
    }));
    app.get('/system/check-token', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if ((0, http_1.multiUserMode)(response)) {
                const user = yield (0, http_1.userFromSession)(request, response);
                if (!user || user.suspended) {
                    response.sendStatus(403).end();
                    return;
                }
                response.sendStatus(200).end();
                return;
            }
            response.sendStatus(200).end();
        }
        catch (e) {
            console.log(e.message, e);
            response.sendStatus(500).end();
        }
    }));
    app.post('/system/update-env', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const body = (0, http_1.reqBody)(request);
            // Only admins can update the ENV settings.
            if ((0, http_1.multiUserMode)(response)) {
                const user = yield (0, http_1.userFromSession)(request, response);
                if (!user || (user === null || user === void 0 ? void 0 : user.role) !== 'admin') {
                    response.sendStatus(401).end();
                    return;
                }
            }
            const { newValues, error } = (0, updateENV_1.updateENV)(body, true);
            if (process.env.NODE_ENV === 'production')
                yield (0, updateENV_1.dumpENV)();
            response.status(200).json({ newValues, error });
        }
        catch (e) {
            console.log(e.message, e);
            response.sendStatus(500).end();
        }
    }));
};
exports.systemEndpoints = systemEndpoints;
