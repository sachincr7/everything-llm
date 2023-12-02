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
exports.isAdmin = exports.queryParams = exports.makeJWT = exports.getAuthToken = exports.userFromSession = exports.decodeJWT = exports.multiUserMode = exports.reqBody = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../../models/user");
function reqBody(request) {
    return typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
}
exports.reqBody = reqBody;
function queryParams(request) {
    return request.query;
}
exports.queryParams = queryParams;
function multiUserMode(response) {
    var _a;
    return (_a = response === null || response === void 0 ? void 0 : response.locals) === null || _a === void 0 ? void 0 : _a.multiUserMode;
}
exports.multiUserMode = multiUserMode;
function decodeJWT(jwtToken) {
    try {
        return jsonwebtoken_1.default.verify(jwtToken, process.env.JWT_SECRET);
    }
    catch (error) {
        console.log(error);
    }
    return { p: null, id: null, username: null };
}
exports.decodeJWT = decodeJWT;
const userFromSession = (request, response = null) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!!response && !!((_a = response.locals) === null || _a === void 0 ? void 0 : _a.user)) {
        return response.locals.user;
    }
    const token = getAuthToken(request);
    if (!token) {
        return null;
    }
    const valid = decodeJWT(token);
    if (!valid || !valid.id) {
        return null;
    }
    const user = yield user_1.UserModel.get({ id: valid.id });
    return user;
});
exports.userFromSession = userFromSession;
function getAuthToken(request) {
    const auth = request.header('Authorization');
    return auth ? auth.split(' ')[1] : null;
}
exports.getAuthToken = getAuthToken;
function makeJWT(info = {}, expiry = '30d') {
    console.log('info', info);
    if (!process.env.JWT_SECRET)
        throw new Error('Cannot create JWT as JWT_SECRET is unset.');
    return jsonwebtoken_1.default.sign(info, process.env.JWT_SECRET, { expiresIn: expiry });
}
exports.makeJWT = makeJWT;
const isAdmin = (user) => { var _a; return (_a = (user && user.role === 'admin')) !== null && _a !== void 0 ? _a : null; };
exports.isAdmin = isAdmin;
