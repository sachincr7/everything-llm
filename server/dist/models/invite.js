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
exports.InviteModel = void 0;
const uuid_apikey_1 = __importDefault(require("uuid-apikey"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class InviteModel {
    static makeCode() {
        return uuid_apikey_1.default.create().apiKey;
    }
    static create(createdByUserId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invite = yield prisma_1.default.invites.create({
                    data: {
                        code: this.makeCode(),
                        createdBy: createdByUserId,
                    },
                });
                return { invite, error: null };
            }
            catch (error) {
                console.error("FAILED TO CREATE INVITE.", error.message);
                return { invite: null, error: error.message };
            }
        });
    }
    static deactivate(inviteId = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.invites.update({
                    where: { id: Number(inviteId) },
                    data: { status: "disabled" },
                });
                return { success: true, error: null };
            }
            catch (error) {
                console.error(error.message);
                return { success: false, error: error.message };
            }
        });
    }
    static markClaimed(inviteId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.invites.update({
                    where: { id: Number(inviteId) },
                    data: { status: "claimed", claimedBy: user.id },
                });
                return { success: true, error: null };
            }
            catch (error) {
                console.error(error.message);
                return { success: false, error: error.message };
            }
        });
    }
    static get(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invite = yield prisma_1.default.invites.findFirst({ where: clause });
                return invite || null;
            }
            catch (error) {
                console.error(error.message);
                return null;
            }
        });
    }
    static count(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield prisma_1.default.invites.count({ where: clause });
                return count;
            }
            catch (error) {
                console.error(error.message);
                return 0;
            }
        });
    }
    static delete(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.invites.deleteMany({ where: clause });
                return true;
            }
            catch (error) {
                console.error(error.message);
                return false;
            }
        });
    }
    static where(clause = {}, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invites = yield prisma_1.default.invites.findMany({
                    where: clause,
                    take: limit || undefined,
                });
                return invites;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        });
    }
}
exports.InviteModel = InviteModel;
