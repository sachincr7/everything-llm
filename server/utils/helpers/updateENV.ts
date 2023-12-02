import path from 'path';
import fs from 'fs';

type KeyMappingConfig = {
  [key: string]: {
    envKey:
      | 'LLM_PROVIDER'
      | 'OPEN_AI_KEY'
      | 'OPEN_MODEL_PREF'
      | 'AZURE_OPENAI_ENDPOINT'
      | 'AZURE_OPENAI_KEY'
      | 'OPEN_MODEL_PREF'
      | 'EMBEDDING_MODEL_PREF'
      | 'VECTOR_DB'
      | 'CHROMA_ENDPOINT'
      | 'CHROMA_API_HEADER'
      | 'CHROMA_API_KEY'
      | 'WEAVIATE_ENDPOINT'
      | 'WEAVIATE_API_KEY'
      | 'QDRANT_ENDPOINT'
      | 'PINECONE_ENVIRONMENT'
      | 'PINECONE_API_KEY'
      | 'QDRANT_API_KEY'
      | 'PINECONE_INDEX'
      | 'AUTH_TOKEN'
      | 'JWT_SECRET';
    checks: Function[];
  };
};

const KEY_MAPPING: KeyMappingConfig = {
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

function isNotEmpty(input = ''): string | null {
  return !input || input.length === 0 ? 'Value cannot be empty' : null;
}

function isValidURL(input = ''): string | null {
  try {
    new URL(input);
    return null;
  } catch (e) {
    return 'URL is not a valid URL.';
  }
}

function validOpenAIKey(input = ''): string | null {
  return input.startsWith('sk-') ? null : 'OpenAI Key must start with sk-';
}

function supportedLLM(input = ''): Boolean {
  return ['openai', 'azure'].includes(input);
}

function validOpenAIModel(input = ''): string | null {
  const validModels = ['gpt-4', 'gpt-3.5-turbo'];
  return validModels.includes(input) ? null : `Invalid Model type. Must be one of ${validModels.join(', ')}.`;
}

function supportedVectorDB(input = ''): string | null {
  const supported = ['chroma', 'pinecone', 'lancedb', 'weaviate', 'qdrant'];
  return supported.includes(input) ? null : `Invalid VectorDB type. Must be one of ${supported.join(', ')}.`;
}

function validChromaURL(input = ''): string | null {
  return input.slice(-1) === '/' ? `Chroma Instance URL should not end in a trailing slash.` : null;
}

function validAzureURL(input = ''): string | null {
  try {
    new URL(input);
    if (!input.includes('openai.azure.com')) return 'URL must include openai.azure.com';
    return null;
  } catch {
    return 'Not a valid URL';
  }
}

function requiresForceMode(_: any, forceModeEnabled = false): string | null {
  return forceModeEnabled === true ? null : 'Cannot set this setting.';
}

function updateENV(
  newENVs: {
    [key: string]: string;
  } = {},
  force = false
) {
  let error = '';
  const validKeys = Object.keys(KEY_MAPPING);

  const ENV_KEYS = Object.keys(newENVs).filter(
    (key) => validKeys.includes(key) && !newENVs[key].includes('******') // strip out answers where the value is all asterisks
  );

  const newValues: any = {};

  ENV_KEYS.forEach((key) => {
    const { envKey, checks } = KEY_MAPPING[key];
    const value = newENVs[key];
    const errors = checks.map((validityCheck: Function) => validityCheck(value, force)).filter((err: any) => typeof err === 'string');

    if (errors.length > 0) {
      error += errors.join('\n');
      return;
    }

    newValues[key] = value;
    process.env[envKey] = value;
  });

  return { newValues, error: error?.length > 0 ? error : false };
}

async function dumpENV() {
  const frozenEnvs: any = {};
  const protectedKeys = [
    ...Object.values(KEY_MAPPING).map((values) => values.envKey),
    "CACHE_VECTORS",
    "STORAGE_DIR",
    "SERVER_PORT",
  ];

  for (const key of protectedKeys) {
    const envValue = process.env?.[key] || null;
    if (!envValue) continue;
    frozenEnvs[key] = process.env?.[key] || null;
  }

  var envResult = `# Auto-dump ENV from system call on ${new Date().toTimeString()}\n`;
  envResult += Object.entries(frozenEnvs)
    .map(([key, value]) => {
      return `${key}='${value}'`;
    })
    .join("\n");

  const envPath = path.join(__dirname, "../../.env");
  fs.writeFileSync(envPath, envResult, { encoding: "utf8", flag: "w" });
  return true;
}

export { updateENV, dumpENV };

// updateENV({
//   // LLMProvider: 'micro',
//   // OpenAiKey: 'AI',
// }, true);
