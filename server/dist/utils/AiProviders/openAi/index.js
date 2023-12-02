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
exports.OpenAi = void 0;
const openai_1 = __importDefault(require("openai"));
const helpers_1 = require("../../helpers");
class OpenAi {
    constructor() {
        const openai = new openai_1.default({
            apiKey: process.env.OPEN_AI_KEY,
        });
        this.openai = openai;
        // Arbitrary limit to ensure we stay within reasonable POST request size.
        this.embeddingChunkLimit = 1000;
    }
    // async embedTextInput(textInput: string) {
    //   const result = await this.embedChunks(textInput);
    //   return result?.[0] || [];
    // }
    embedChunks(textChunks = []) {
        return __awaiter(this, void 0, void 0, function* () {
            // Because there is a hard POST limit on how many chunks can be sent at once to OpenAI (~8mb)
            // we concurrently execute each max batch of text chunks possible.
            // Refer to constructor embeddingChunkLimit for more info.
            const embeddingRequests = [];
            console.log((0, helpers_1.toChunks)(textChunks, this.embeddingChunkLimit));
            for (const chunk of (0, helpers_1.toChunks)(textChunks, this.embeddingChunkLimit)) {
                embeddingRequests.push(new Promise((resolve) => {
                    this.openai.embeddings
                        .create({
                        input: chunk,
                        model: 'text-embedding-ada-002',
                    })
                        .then((res) => {
                        resolve({
                            data: res.data,
                            error: null,
                        });
                    })
                        .catch((e) => {
                        console.log(e);
                        resolve({ data: [], error: e === null || e === void 0 ? void 0 : e.error });
                    });
                }));
            }
            const { data = [], error = null } = yield Promise.all(embeddingRequests).then((results) => {
                // If any errors were returned from OpenAI abort the entire sequence because the embeddings
                // will be incomplete.
                const errors = results
                    .filter((res) => !!res.error)
                    .map((res) => res.error)
                    .flat();
                if (errors.length > 0) {
                    return {
                        data: [],
                        error: `(${errors.length}) Embedding Errors! ${errors.map((error) => `[${error.type}]: ${error.message}`).join(', ')}`,
                    };
                }
                return {
                    data: results.map((res) => (res === null || res === void 0 ? void 0 : res.data) || []).flat(),
                    error: null,
                };
            });
            if (!!error)
                throw new Error(`OpenAI Failed to embed: ${error}`);
            return data.length > 0 &&
                data.every((embd) => embd.hasOwnProperty("embedding"))
                ? data.map((embd) => embd.embedding)
                : null;
        });
    }
}
exports.OpenAi = OpenAi;
