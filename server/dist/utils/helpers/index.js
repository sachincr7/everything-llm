"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLMProvider = exports.toChunks = exports.getVectorDbClass = void 0;
const pinecone_1 = require("../vectorDbProviders/pinecone");
const openAi_1 = require("../AiProviders/openAi");
function getVectorDbClass() {
    const vectorSelection = process.env.VECTOR_DB || 'pinecone';
    switch (vectorSelection) {
        case 'pinecone':
            return pinecone_1.PineconeDB;
        default:
            throw new Error('ENV: No VECTOR_DB value found in environment!');
    }
}
exports.getVectorDbClass = getVectorDbClass;
function toChunks(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) => arr.slice(i * size, i * size + size));
}
exports.toChunks = toChunks;
function getLLMProvider() {
    const vectorSelection = process.env.LLM_PROVIDER || 'openai';
    switch (vectorSelection) {
        case 'openai':
            return new openAi_1.OpenAi();
        // case "azure":
        //   const { AzureOpenAi } = require("../AiProviders/azureOpenAi");
        //   return new AzureOpenAi();
        default:
            throw new Error('ENV: No LLM_PROVIDER value found in environment!');
    }
}
exports.getLLMProvider = getLLMProvider;
