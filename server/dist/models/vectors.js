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
exports.DocumentVectors = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class DocumentVectors {
    static bulkInsert(vectorRecords = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vectorRecords.length === 0)
                return;
            try {
                const inserts = [];
                vectorRecords.forEach((record) => {
                    inserts.push(prisma_1.default.document_vectors.create({
                        data: {
                            docId: record === null || record === void 0 ? void 0 : record.docId,
                            vectorId: record.vectorId,
                        },
                    }));
                });
                yield prisma_1.default.$transaction(inserts);
                return { documentsInserted: inserts.length };
            }
            catch (error) {
                console.error('Bulk insert failed', error);
                return { documentsInserted: 0 };
            }
        });
    }
}
exports.DocumentVectors = DocumentVectors;
