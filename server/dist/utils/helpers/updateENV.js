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
exports.dumpENV = exports.updateENV = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const KEY_MAPPING = {
    LLMProvider: {
        envKey: 'LLM_PROVIDER',
        checks: [isNotEmpty, supportedLLM],
    },
    // OpenAI Settings
    OpenAiKey: {
        envKey: 'OPEN_AI_KEY',
        checks: [isNotEmpty, validOpenAIKey],
    },
    OpenAiModelPref: {
        envKey: 'OPEN_MODEL_PREF',
        checks: [isNotEmpty, validOpenAIModel],
    },
    // Azure OpenAI Settings
    AzureOpenAiEndpoint: {
        envKey: 'AZURE_OPENAI_ENDPOINT',
        checks: [isNotEmpty, validAzureURL],
    },
    AzureOpenAiKey: {
        envKey: 'AZURE_OPENAI_KEY',
        checks: [isNotEmpty],
    },
    AzureOpenAiModelPref: {
        envKey: 'OPEN_MODEL_PREF',
        checks: [isNotEmpty],
    },
    AzureOpenAiEmbeddingModelPref: {
        envKey: 'EMBEDDING_MODEL_PREF',
        checks: [isNotEmpty],
    },
    // Vector Database Selection Settings
    VectorDB: {
        envKey: 'VECTOR_DB',
        checks: [isNotEmpty, supportedVectorDB],
    },
    // Chroma Options
    ChromaEndpoint: {
        envKey: 'CHROMA_ENDPOINT',
        checks: [isValidURL, validChromaURL],
    },
    ChromaApiHeader: {
        envKey: 'CHROMA_API_HEADER',
        checks: [],
    },
    ChromaApiKey: {
        envKey: 'CHROMA_API_KEY',
        checks: [],
    },
    // Weaviate Options
    WeaviateEndpoint: {
        envKey: 'WEAVIATE_ENDPOINT',
        checks: [isValidURL],
    },
    WeaviateApiKey: {
        envKey: 'WEAVIATE_API_KEY',
        checks: [],
    },
    // QDrant Options
    QdrantEndpoint: {
        envKey: 'QDRANT_ENDPOINT',
        checks: [isValidURL],
    },
    QdrantApiKey: {
        envKey: 'QDRANT_API_KEY',
        checks: [],
    },
    PineConeEnvironment: {
        envKey: 'PINECONE_ENVIRONMENT',
        checks: [],
    },
    PineConeKey: {
        envKey: 'PINECONE_API_KEY',
        checks: [],
    },
    PineConeIndex: {
        envKey: 'PINECONE_INDEX',
        checks: [],
    },
    // System Settings
    AuthToken: {
        envKey: 'AUTH_TOKEN',
        checks: [requiresForceMode],
    },
    JWTSecret: {
        envKey: 'JWT_SECRET',
        checks: [requiresForceMode],
    },
    // Not supported yet.
    // 'StorageDir': 'STORAGE_DIR',
};
function isNotEmpty(input = '') {
    return !input || input.length === 0 ? 'Value cannot be empty' : null;
}
function isValidURL(input = '') {
    try {
        new URL(input);
        return null;
    }
    catch (e) {
        return 'URL is not a valid URL.';
    }
}
function validOpenAIKey(input = '') {
    return input.startsWith('sk-') ? null : 'OpenAI Key must start with sk-';
}
function supportedLLM(input = '') {
    return ['openai', 'azure'].includes(input);
}
function validOpenAIModel(input = '') {
    const validModels = ['gpt-4', 'gpt-3.5-turbo'];
    return validModels.includes(input) ? null : `Invalid Model type. Must be one of ${validModels.join(', ')}.`;
}
function supportedVectorDB(input = '') {
    const supported = ['chroma', 'pinecone', 'lancedb', 'weaviate', 'qdrant'];
    return supported.includes(input) ? null : `Invalid VectorDB type. Must be one of ${supported.join(', ')}.`;
}
function validChromaURL(input = '') {
    return input.slice(-1) === '/' ? `Chroma Instance URL should not end in a trailing slash.` : null;
}
function validAzureURL(input = '') {
    try {
        new URL(input);
        if (!input.includes('openai.azure.com'))
            return 'URL must include openai.azure.com';
        return null;
    }
    catch (_a) {
        return 'Not a valid URL';
    }
}
function requiresForceMode(_, forceModeEnabled = false) {
    return forceModeEnabled === true ? null : 'Cannot set this setting.';
}
function updateENV(newENVs = {}, force = false) {
    let error = '';
    const validKeys = Object.keys(KEY_MAPPING);
    const ENV_KEYS = Object.keys(newENVs).filter((key) => validKeys.includes(key) && !newENVs[key].includes('******') // strip out answers where the value is all asterisks
    );
    const newValues = {};
    ENV_KEYS.forEach((key) => {
        const { envKey, checks } = KEY_MAPPING[key];
        const value = newENVs[key];
        const errors = checks.map((validityCheck) => validityCheck(value, force)).filter((err) => typeof err === 'string');
        if (errors.length > 0) {
            error += errors.join('\n');
            return;
        }
        newValues[key] = value;
        process.env[envKey] = value;
    });
    return { newValues, error: (error === null || error === void 0 ? void 0 : error.length) > 0 ? error : false };
}
exports.updateENV = updateENV;
function dumpENV() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const frozenEnvs = {};
        const protectedKeys = [
            ...Object.values(KEY_MAPPING).map((values) => values.envKey),
            "CACHE_VECTORS",
            "STORAGE_DIR",
            "SERVER_PORT",
        ];
        for (const key of protectedKeys) {
            const envValue = ((_a = process.env) === null || _a === void 0 ? void 0 : _a[key]) || null;
            if (!envValue)
                continue;
            frozenEnvs[key] = ((_b = process.env) === null || _b === void 0 ? void 0 : _b[key]) || null;
        }
        var envResult = `# Auto-dump ENV from system call on ${new Date().toTimeString()}\n`;
        envResult += Object.entries(frozenEnvs)
            .map(([key, value]) => {
            return `${key}='${value}'`;
        })
            .join("\n");
        const envPath = path_1.default.join(__dirname, "../../.env");
        fs_1.default.writeFileSync(envPath, envResult, { encoding: "utf8", flag: "w" });
        return true;
    });
}
exports.dumpENV = dumpENV;
// updateENV({
//   // LLMProvider: 'micro',
//   // OpenAiKey: 'AI',
// }, true);
