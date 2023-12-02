import prisma from '../utils/prisma';

type Updates = {
  [key: string]: string | null;
};

function isEmptyObject(obj = {}) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export class SystemSettings {
  static supportedFields = ['multi_user_mode', 'users_can_delete_workspaces', 'limit_user_messages', 'message_limit', 'logo_filename', 'telemetry_id'];

  static async get(clause = {}) {
    try {
      return (
        (await prisma.system_settings.findFirst({
          where: clause,
        })) ?? null
      );
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }

  static async isMultiUserMode() {
    try {
      const setting = await this.get({ label: 'multi_user_mode' });
      return setting?.value === 'true';
    } catch (error: any) {
      console.error(error.message);
      return false;
    }
  }

  static async currentSettings() {
    const llmProvider = process.env.LLM_PROVIDER || 'openai';
    const vectorDB = process.env.VECTOR_DB || 'pinecone';

    return {
      CanDebug: !!!process.env.NO_DEBUG,
      RequiresAuth: !!process.env.AUTH_TOKEN,
      AuthToken: !!process.env.AUTH_TOKEN,
      JWTSecret: !!process.env.JWT_SECRET,
      StorageDir: process.env.STORAGE_DIR,
      MultiUserMode: await this.isMultiUserMode(),
      VectorDB: vectorDB,
      ...(vectorDB === 'pinecone'
        ? {
            PineConeEnvironment: process.env.PINECONE_ENVIRONMENT,
            PineConeKey: !!process.env.PINECONE_API_KEY,
            PineConeIndex: process.env.PINECONE_INDEX,
          }
        : {}),
      ...(vectorDB === 'chroma'
        ? {
            ChromaEndpoint: process.env.CHROMA_ENDPOINT,
            ChromaApiHeader: process.env.CHROMA_API_HEADER,
            ChromaApiKey: !!process.env.CHROMA_API_KEY,
          }
        : {}),
      ...(vectorDB === 'weaviate'
        ? {
            WeaviateEndpoint: process.env.WEAVIATE_ENDPOINT,
            WeaviateApiKey: process.env.WEAVIATE_API_KEY,
          }
        : {}),
      ...(vectorDB === 'qdrant'
        ? {
            QdrantEndpoint: process.env.QDRANT_ENDPOINT,
            QdrantApiKey: process.env.QDRANT_API_KEY,
          }
        : {}),
      LLMProvider: llmProvider,
      ...(llmProvider === 'openai'
        ? {
            OpenAiKey: !!process.env.OPEN_AI_KEY,
            OpenAiModelPref: process.env.OPEN_MODEL_PREF || 'gpt-3.5-turbo',
          }
        : {}),

      ...(llmProvider === 'azure'
        ? {
            AzureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
            AzureOpenAiKey: !!process.env.AZURE_OPENAI_KEY,
            AzureOpenAiModelPref: process.env.OPEN_MODEL_PREF,
            AzureOpenAiEmbeddingModelPref: process.env.EMBEDDING_MODEL_PREF,
          }
        : {}),
    };
  }

  static async where(clause = {}, limit: number) {
    try {
      const settings = await prisma.system_settings.findMany({
        where: clause,
        take: limit || undefined,
      });
      return settings;
    } catch (error: any) {
      console.error(error.message);
      return [];
    }
  }

  static async updateSettings(updates: Updates = {}) {
    try {
      if (isEmptyObject(updates)) {
        return { success: false, error: null };
      }
      
      const updatePromises = Object.keys(updates)
        .filter((key) => this.supportedFields.includes(key))
        .map((key) => {
          return prisma.system_settings.upsert({
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

      await Promise.all(updatePromises);
      return { success: true, error: null };
    } catch (error: any) {
      console.error("FAILED TO UPDATE SYSTEM SETTINGS", error.message);
      return { success: false, error: error.message };
    }
  }
}
