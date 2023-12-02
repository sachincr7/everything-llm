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
exports.validApiKey = void 0;
const systemSettings_1 = require("../../models/systemSettings");
const apiKeys_1 = __importDefault(require("../../models/apiKeys"));
function validApiKey(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const multiUserMode = yield systemSettings_1.SystemSettings.isMultiUserMode();
        response.locals.multiUserMode = multiUserMode;
        const auth = request.header("Authorization");
        const bearerKey = auth ? auth.split(" ")[1] : null;
        if (!bearerKey) {
            response.status(403).json({
                error: "No valid api key found.",
            });
            return;
        }
        if (!(yield apiKeys_1.default.get({ secret: bearerKey }))) {
            response.status(403).json({
                error: "No valid api key found.",
            });
            return;
        }
        next();
    });
}
exports.validApiKey = validApiKey;
