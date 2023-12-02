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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const helpers_1 = require("../utils/helpers");
const files_1 = require("../utils/files");
const uuid_1 = require("uuid");
const prisma_1 = __importDefault(require("../utils/prisma"));
class Document {
    static addDocuments(workspace, additions = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const VectorDb = (0, helpers_1.getVectorDbClass)();
            if (additions.length === 0)
                return;
            const embedded = [];
            const failedToEmbed = [];
            for (const path of additions) {
                const data = yield (0, files_1.fileData)(path);
                if (!data)
                    continue;
                const docId = (0, uuid_1.v4)();
                const { pageContent } = data, metadata = __rest(data, ["pageContent"]);
                const newDoc = {
                    docId,
                    filename: path.split("/")[1],
                    docpath: path,
                    workspaceId: workspace.id,
                    metadata: JSON.stringify(metadata),
                };
                const vectorized = yield VectorDb.addDocumentToNamespace(workspace.slug, Object.assign(Object.assign({}, data), { docId }), path);
                if (!vectorized) {
                    console.error("Failed to vectorize", path);
                    failedToEmbed.push(path);
                    continue;
                }
                try {
                    yield prisma_1.default.workspace_documents.create({ data: newDoc });
                    embedded.push(path);
                }
                catch (error) {
                    console.error(error.message);
                }
                return { failed: failedToEmbed, embedded, vectorized };
            }
        });
    }
    static forWorkspace(workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!workspaceId)
                return [];
            return yield prisma_1.default.workspace_documents.findMany({
                where: { workspaceId },
            });
        });
    }
}
exports.Document = Document;
