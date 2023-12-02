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
exports.Workspace = void 0;
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const workspaceUsers_1 = require("./workspaceUsers");
const documents_1 = require("./documents");
class Workspace {
    static new(name, creatorId = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let slug = (0, slugify_1.default)(name, { lower: true });
            const existingBySlug = yield this.get({ slug });
            if (existingBySlug !== null) {
                const slugSeed = Math.floor(10000000 + Math.random() * 90000000);
                slug = (0, slugify_1.default)(`${name}-${slugSeed}`, { lower: true });
            }
            try {
                const workspace = yield prisma_1.default.workspaces.create({
                    data: { name, slug },
                });
                // If created with a user then we need to create the relationship as well.
                // If creating with an admin User it wont change anything because admins can
                // view all workspaces anyway.
                if (!!creatorId)
                    yield workspaceUsers_1.WorkspaceUser.create(creatorId, workspace.id);
                return { workspace, message: null };
            }
            catch (error) {
                console.error(error.message);
                return { workspace: null, message: error.message };
            }
        });
    }
    static get(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workspace = yield prisma_1.default.workspaces.findFirst({
                    where: clause,
                    include: {
                        documents: true,
                    },
                });
                return workspace || null;
            }
            catch (error) {
                console.error(error.message);
                return null;
            }
        });
    }
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw new Error('No workspace id provided for update');
            const validKeys = Object.keys(data).filter((key) => this.writable.includes(key));
            if (validKeys.length === 0)
                return { workspace: { id }, message: 'No valid fields to update!' };
            try {
                const workspace = yield prisma_1.default.workspaces.update({
                    where: { id },
                    data,
                });
                return { workspace, message: null };
            }
            catch (error) {
                console.error(error.message);
                return { workspace: null, message: error.message };
            }
        });
    }
    static getWithUser(user, clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((user === null || user === void 0 ? void 0 : user.role) === 'admin')
                return this.get(clause);
            try {
                const workspace = yield prisma_1.default.workspaces.findFirst({
                    where: Object.assign(Object.assign({}, clause), { workspace_users: {
                            some: {
                                user_id: user === null || user === void 0 ? void 0 : user.id,
                            },
                        }, deletedAt: null, deletedBy: null }),
                    include: {
                        workspace_users: true,
                        documents: true,
                    },
                });
                if (!workspace)
                    return null;
                return Object.assign(Object.assign({}, workspace), { documents: yield documents_1.Document.forWorkspace(workspace.id) });
            }
            catch (error) {
                console.error(error.message);
                return null;
            }
        });
    }
    static delete(workspaceId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.workspaces.update({
                    where: { id: parseInt(workspaceId) },
                    data: {
                        deletedAt: new Date(),
                        deletedBy: adminId,
                    },
                });
                return true;
            }
            catch (error) {
                console.error(error.message);
                return false;
            }
        });
    }
    static where(clause = {}, limit = null, orderBy = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield prisma_1.default.workspaces.findMany(Object.assign(Object.assign({ where: Object.assign(Object.assign({}, clause), { deletedAt: null, deletedBy: null }) }, (limit !== null ? { take: limit } : {})), (orderBy !== null ? { orderBy } : {})));
                return results;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        });
    }
    static whereWithUser(user, clause = {}, limit = null, orderBy = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role === 'admin')
                return yield this.where(clause, limit, orderBy);
            try {
                const workspaces = yield prisma_1.default.workspaces.findMany(Object.assign(Object.assign({ where: Object.assign(Object.assign({}, clause), { workspace_users: {
                            some: {
                                user_id: user.id,
                            },
                        }, deletedAt: null, deletedBy: null }) }, (limit !== null ? { take: limit } : {})), (orderBy !== null ? { orderBy } : {})));
                return workspaces;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        });
    }
    static updateUsers(userId, workspaceId, userIds = []) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield workspaceUsers_1.WorkspaceUser.delete(userId, workspaceId);
                yield workspaceUsers_1.WorkspaceUser.createManyUsers(userIds, workspaceId);
                return { success: true, error: null };
            }
            catch (error) {
                console.error(error.message);
                return { success: false, error: error.message };
            }
        });
    }
}
exports.Workspace = Workspace;
Workspace.writable = [
    // Used for generic updates so we can validate keys in request body
    'name',
    'slug',
    'vectorTag',
    'openAiTemp',
    'openAiHistory',
    'lastUpdatedAt',
    'openAiPrompt',
];
