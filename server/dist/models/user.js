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
exports.UserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserModel {
    static create({ username, password, role = 'default' }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = bcrypt_1.default.hashSync(password, 10);
                const user = yield prisma_1.default.users.create({
                    data: {
                        username,
                        password: hashedPassword,
                        role,
                    },
                });
                return { user, error: null };
            }
            catch (error) {
                console.error('FAILED TO CREATE USER.', error.message);
                return { user: null, error: error.message };
            }
        });
    }
    static get(clause = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.users.findFirst({ where: clause });
                return user ? Object.assign({}, user) : null;
            }
            catch (error) {
                console.error(error.message);
                return null;
            }
        });
    }
    static update(userId, updates = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.users.update({
                    where: { id: parseInt(userId) },
                    data: updates,
                });
                return { success: true, error: null };
            }
            catch (error) {
                console.error(error.message);
                return { success: false, error: error.message };
            }
        });
    }
    static delete(userId, adminId = 99) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.users.update({
                    where: { id: parseInt(userId) },
                    data: {
                        deletedAt: new Date(),
                        deletedBy: adminId,
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
    static where(clause = {}, limit = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma_1.default.users.findMany(Object.assign({ where: clause }, (limit !== null ? { take: limit } : {})));
                return users;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        });
    }
}
exports.UserModel = UserModel;
