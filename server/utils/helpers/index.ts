import { PineconeDB } from '../vectorDbProviders/pinecone';
import { OpenAi } from '../AiProviders/openAi';

export function getVectorDbClass() {
  const vectorSelection = process.env.VECTOR_DB || 'pinecone';
  switch (vectorSelection) {
    case 'pinecone':
      return PineconeDB;
    default:
      throw new Error('ENV: No VECTOR_DB value found in environment!');
  }
}

export function toChunks(
  arr: {
    id: string;
    values: number[];
    metadata: any;
  }[],
  size: number
) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) => arr.slice(i * size, i * size + size));
}

export function getLLMProvider() {
  const vectorSelection = process.env.LLM_PROVIDER || 'openai';
  switch (vectorSelection) {
    case 'openai':
      return new OpenAi();
    // case "azure":
    //   const { AzureOpenAi } = require("../AiProviders/azureOpenAi");
    //   return new AzureOpenAi();
    default:
      throw new Error('ENV: No LLM_PROVIDER value found in environment!');
  }
}
