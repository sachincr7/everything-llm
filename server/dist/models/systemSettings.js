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
exports.SystemSettings = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
function isEmptyObject(obj = {}) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
class SystemSettings {
    static get(clause = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return ((_a = (yield prisma_1.default.system_settings.findFirst({
                    where: clause,
                }))) !== null && _a !== void 0 ? _a : null);
            }
            catch (error) {
                console.error(error.message);
                return null;
            }
        });
    }
    static isMultiUserMode() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const setting = yield this.get({ label: 'multi_user_mode' });
                return (setting === null || setting === void 0 ? void 0 : setting.value) === 'true';
            }
            catch (error) {
                console.error(error.message);
                return false;
            }
        });
    }
    static currentSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const llmProvider = process.env.LLM_PROVIDER || 'openai';
            const vectorDB = process.env.VECTOR_DB || 'pinecone';
            return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ CanDebug: !!!process.env.NO_DEBUG, RequiresAuth: !!process.env.AUTH_TOKEN, AuthToken: !!process.env.AUTH_TOKEN, JWTSecret: !!process.env.JWT_SECRET, StorageDir: process.env.STORAGE_DIR, MultiUserMode: yield this.isMultiUserMode(), VectorDB: vectorDB }, (vectorDB === 'pinecone'
                ? {
                    PineConeEnvironment: process.env.PINECONE_ENVIRONMENT,
                    PineConeKey: !!process.env.PINECONE_API_KEY,
                    PineConeIndex: process.env.PINECONE_INDEX,
                }
                : {})), (vectorDB === 'chroma'
                ? {
                    ChromaEndpoint: process.env.CHROMA_ENDPOINT,
                    ChromaApiHeader: process.env.CHROMA_API_HEADER,
                    ChromaApiKey: !!process.env.CHROMA_API_KEY,
                }
                : {})), (vectorDB === 'weaviate'
                ? {
                    WeaviateEndpoint: process.env.WEAVIATE_ENDPOINT,
                    WeaviateApiKey: process.env.WEAVIATE_API_KEY,
                }
                : {})), (vectorDB === 'qdrant'
                ? {
                    QdrantEndpoint: process.env.QDRANT_ENDPOINT,
                    QdrantApiKey: process.env.QDRANT_API_KEY,
                }
                : {})), { LLMProvider: llmProvider }), (llmProvider === 'openai'
                ? {
                    OpenAiKey: !!process.env.OPEN_AI_KEY,
                    OpenAiModelPref: process.env.OPEN_MODEL_PREF || 'gpt-3.5-turbo',
                }
                : {})), (llmProvider === 'azure'
                ? {
                    AzureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
                    AzureOpenAiKey: !!process.env.AZURE_OPENAI_KEY,
                    AzureOpenAiModelPref: process.env.OPEN_MODEL_PREF,
                    AzureOpenAiEmbeddingModelPref: process.env.EMBEDDING_MODEL_PREF,
                }
                : {}));
        });
    }
    static where(clause = {}, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield prisma_1.default.system_settings.findMany({
                    where: clause,
                    take: limit || undefined,
                });
                return settings;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        });
    }
    static updateSettings(updates = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (isEmptyObject(updates)) {
                    return { success: false, error: null };
                }
                const updatePromises = Object.keys(updates)
                    .filter((key) => this.supportedFields.includes(key))
                    .map((key) => {
                    return prisma_1.default.system_settings.upsert({
                        where: { label: key },
                        update: {
                            value: updates[key] === null ? null : String(updates[key]),
                        },
                        create: {
                            label: key,
                            value: updates[key] === null ? null : String(updates[key]),
                        },
                    });
                });
                yield Promise.all(updatePromises);
                return { success: true, error: null };
            }
            catch (error) {
                console.error("FAILED TO UPDATE SYSTEM SETTINGS", error.message);
                return { success: false, error: error.message };
            }
        });
    }
}
exports.SystemSettings = SystemSettings;
SystemSettings.supportedFields = ['multi_user_mode', 'users_can_delete_workspaces', 'limit_user_messages', 'message_limit', 'logo_filename', 'telemetry_id'];
