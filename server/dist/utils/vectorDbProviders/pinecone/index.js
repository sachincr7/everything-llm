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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeDB = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const uuid_1 = require("uuid");
const text_splitter_1 = require("langchain/text_splitter");
const helpers_1 = require("../../helpers");
const vectors_1 = require("../../../models/vectors");
class PineconeDB {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.VECTOR_DB !== 'pinecone')
                throw new Error('Pinecone::Invalid ENV settings');
            if (this.instance) {
                return this.instance;
            }
            const client = new pinecone_1.Pinecone({
                apiKey: process.env.PINECONE_API_KEY,
                environment: process.env.PINECONE_ENVIRONMENT,
            });
            const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
            const { status } = yield client.describeIndex(process.env.PINECONE_INDEX);
            if (!(status === null || status === void 0 ? void 0 : status.ready))
                throw new Error('Pinecode::Index not ready.');
            this.instance = { client, pineconeIndex, indexName: process.env.PINECONE_INDEX };
            return { client, pineconeIndex, indexName: process.env.PINECONE_INDEX };
        });
    }
    static namespace(index, namespace) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!namespace)
                throw new Error('No namespace value provided.');
            // const { namespaces } = await index.describeIndex(namespace);
            // return namespaces.hasOwnProperty(namespace) ? namespaces[namespace] : null;
        });
    }
    static addDocumentToNamespace(namespace, documentData, fullFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { pageContent, docId } = documentData, metadata = __rest(documentData, ["pageContent", "docId"]);
                if (!pageContent || pageContent.length == 0)
                    return false;
                console.log('Adding new vectorized document into namespace', namespace);
                const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                    chunkSize: 1000,
                    chunkOverlap: 20,
                });
                const textChunks = yield textSplitter.splitText(pageContent);
                console.log('Chunks created from document:', textChunks.length);
                const LLMConnector = (0, helpers_1.getLLMProvider)();
                const documentVectors = [];
                const vectors = [];
                const vectorValues = yield LLMConnector.embedChunks(textChunks);
                if (!!vectorValues && vectorValues.length > 0) {
                    for (const [i, vector] of vectorValues.entries()) {
                        const vectorRecord = {
                            id: (0, uuid_1.v4)(),
                            values: vector,
                            // [DO NOT REMOVE]
                            // LangChain will be unable to find your text if you embed manually and dont include the `text` key.
                            // https://github.com/hwchase17/langchainjs/blob/2def486af734c0ca87285a48f1a04c057ab74bdf/langchain/src/vectorstores/pinecone.ts#L64
                            metadata: Object.assign(Object.assign({}, metadata), { text: textChunks[i] }),
                        };
                        vectors.push(vectorRecord);
                        documentVectors.push({ docId, vectorId: vectorRecord.id });
                    }
                }
                else {
                    throw new Error('Could not embed document chunks! This document will not be recorded.');
                }
                if (vectors.length > 0) {
                    const { pineconeIndex } = yield this.connect();
                    for (const chunk of (0, helpers_1.toChunks)(vectors, 100)) {
                        console.log('Inserting vectorized chunks into Pinecone.');
                        pineconeIndex.upsert(chunk.map((c) => {
                            return {
                                id: namespace,
                                values: c.values,
                            };
                        }));
                    }
                }
                yield vectors_1.DocumentVectors.bulkInsert(documentVectors);
                return true;
            }
            catch (error) {
                console.error(error);
                console.error('addDocumentToNamespace', error.message);
                return false;
            }
        });
    }
}
exports.PineconeDB = PineconeDB;
PineconeDB.instance = null;
