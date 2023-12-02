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
exports.WorkspaceUser = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class WorkspaceUser {
    static create(userId, workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.workspace_users.create({
                    data: { user_id: Number(userId), workspace_id: Number(workspaceId) },
                });
                return true;
            }
            catch (error) {
                console.error('FAILED TO CREATE WORKSPACE_USER RELATIONSHIP.', error.message);
                return false;
            }
        });
    }
    static createManyUsers(userIds = [], workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userIds.length === 0)
                return;
            try {
                yield prisma_1.default.$transaction(userIds.map((userId) => prisma_1.default.workspace_users.create({
                    data: {
                        user_id: Number(userId),
                        workspace_id: Number(workspaceId),
                    },
                })));
            }
            catch (error) {
                console.error(error.message);
            }
            return;
        });
    }
    static createMany(userId, workspaceIds = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (workspaceIds.length === 0)
                return;
            try {
                yield prisma_1.default.$transaction(workspaceIds.map((workspaceId) => prisma_1.default.workspace_users.create({
                    data: { user_id: userId, workspace_id: workspaceId },
                })));
            }
            catch (error) {
                console.error(error.message);
            }
            return;
        });
    }
    static get(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield prisma_1.default.workspace_users.findFirst({ where: clause });
                return result || null;
            }
            catch (error) {
                console.error(error.message);
                return null;
            }
        });
    }
    static where(clause = {}, limit = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield prisma_1.default.workspace_users.findMany(Object.assign({ where: clause }, (limit !== null ? { take: limit } : {})));
                return results;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        });
    }
    static delete(userId, workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.workspace_users.updateMany({
                    where: {
                        workspace_id: parseInt(workspaceId),
                        user_id: parseInt(userId),
                    },
                    data: {
                        deletedAt: new Date(),
                        deletedBy: parseInt(workspaceId),
                    },
                });
                return { success: true, error: null };
            }
            catch (error) {
                console.error(error.message);
                return { success: false, error: error.message };
            }
        });
    }
    static count(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield prisma_1.default.workspace_users.count({ where: clause });
                return count;
            }
            catch (error) {
                console.error(error.message);
                return 0;
            }
        });
    }
}
exports.WorkspaceUser = WorkspaceUser;
