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
exports.validatedRequest = void 0;
const systemSettings_1 = require("../../models/systemSettings");
const user_1 = require("../../models/user");
const http_1 = require("../http");
function validatedRequest(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const multiUserMode = yield systemSettings_1.SystemSettings.isMultiUserMode();
        response.locals.multiUserMode = multiUserMode;
        if (multiUserMode)
            return yield validateMultiUserRequest(request, response, next);
        // When in development passthrough auth token for ease of development.
        // Or if the user simply did not set an Auth token or JWT Secret
        if (process.env.NODE_ENV === 'development' || !process.env.AUTH_TOKEN || !process.env.JWT_SECRET) {
            next();
            return;
        }
        if (!process.env.AUTH_TOKEN) {
            response.status(403).json({
                error: 'You need to set an AUTH_TOKEN environment variable.',
            });
            return;
        }
        const token = (0, http_1.getAuthToken)(request);
        if (!token) {
            response.status(403).json({
                error: 'No auth token found.',
            });
            return;
        }
        const { p } = (0, http_1.decodeJWT)(token);
        if (p !== process.env.AUTH_TOKEN) {
            response.status(403).json({
                error: 'Invalid auth token found.',
            });
            return;
        }
        next();
    });
}
exports.validatedRequest = validatedRequest;
function validateMultiUserRequest(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = (0, http_1.getAuthToken)(request);
        if (!token) {
            response.status(403).json({
                error: 'No auth token found.',
            });
            return;
        }
        const valid = (0, http_1.decodeJWT)(token);
        if (!valid || !valid.id) {
            response.status(403).json({
                error: 'Invalid auth token.',
            });
            return;
        }
        const user = yield user_1.UserModel.get({ id: valid.id });
        if (!user) {
            response.status(403).json({
                error: 'Invalid auth for user.',
            });
            return;
        }
        response.locals.user = user;
        next();
    });
}
