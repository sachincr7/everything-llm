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
const prisma_1 = __importDefault(require("../utils/prisma"));
class ApiKeys {
    constructor() {
        this.tablename = "api_keys";
        this.writable = [];
    }
    static get(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = yield prisma_1.default.api_keys.findFirst({ where: clause });
                return apiKey;
            }
            catch (error) {
                console.error("FAILED TO GET API KEY.", error.message);
                return null;
            }
        });
    }
}
exports.default = ApiKeys;
