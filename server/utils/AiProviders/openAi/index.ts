import OpenAI from 'openai';
import { toChunks } from '../../helpers';
import { CreateEmbeddingResponse, Embedding } from 'openai/resources';

type CreateEmbeddingResponseType = {
  data: Embedding[],
  error: any
}

export class OpenAi {
  private openai;
  private embeddingChunkLimit;

  constructor() {
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });
    this.openai = openai;

    // Arbitrary limit to ensure we stay within reasonable POST request size.
    this.embeddingChunkLimit = 1_000;
  }

  // async embedTextInput(textInput: string) {
  //   const result = await this.embedChunks(textInput);
  //   return result?.[0] || [];
  // }

  async embedChunks(textChunks: string[] = []) {
    // Because there is a hard POST limit on how many chunks can be sent at once to OpenAI (~8mb)
    // we concurrently execute each max batch of text chunks possible.
    // Refer to constructor embeddingChunkLimit for more info.
 
    const embeddingRequests: Promise<CreateEmbeddingResponseType>[] = [];
    console.log(toChunks(textChunks, this.embeddingChunkLimit));
    for (const chunk of toChunks(textChunks, this.embeddingChunkLimit)) {
      embeddingRequests.push(
        new Promise((resolve) => {
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
            .catch((e: any) => {
              console.log(e);

              resolve({ data: [], error: e?.error });
            });
        })
      );
    }

    const { data = [], error = null } = await Promise.all(embeddingRequests).then((results) => {
      // If any errors were returned from OpenAI abort the entire sequence because the embeddings
      // will be incomplete.
      const errors = results
        .filter((res: any) => !!res.error)
        .map((res: any) => res.error)
        .flat();
      if (errors.length > 0) {
        return {
          data: [],
          error: `(${errors.length}) Embedding Errors! ${errors.map((error) => `[${error.type}]: ${error.message}`).join(', ')}`,
        };
      }
  
      return {
        data: results.map((res) => res?.data || []).flat(),
        error: null,
      };
    });

    if (!!error) throw new Error(`OpenAI Failed to embed: ${error}`);
    return data.length > 0 &&
      data.every((embd) => embd.hasOwnProperty("embedding"))
      ? data.map((embd) => embd.embedding)
      : null;
  }
}
