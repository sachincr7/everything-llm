import { Index, IndexMetaStatus, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import { cachedVectorInformation } from '../../files';
import { v4 as uuidv4 } from 'uuid';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getLLMProvider, toChunks } from '../../helpers';

type PinecodeInstance = {
  client: Pinecone;
  pineconeIndex: Index<RecordMetadata>;
  indexName: string;
};

export class PineconeDB {
  private static instance: PinecodeInstance | null = null;

  static async connect() {
    if (process.env.VECTOR_DB !== 'pinecone') throw new Error('Pinecone::Invalid ENV settings');

    if (this.instance) {
      return this.instance;
    }

    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
      environment: process.env.PINECONE_ENVIRONMENT as string,
    });

    const pineconeIndex = client.index(process.env.PINECONE_INDEX!);
    const { status } = await client.describeIndex(process.env.PINECONE_INDEX!);

    if (!status?.ready) throw new Error('Pinecode::Index not ready.');

    this.instance = { client, pineconeIndex, indexName: process.env.PINECONE_INDEX! };

    return { client, pineconeIndex, indexName: process.env.PINECONE_INDEX };
  }

  static async namespace(index: Pinecone, namespace: string) {
    if (!namespace) throw new Error('No namespace value provided.');
    // const { namespaces } = await index.describeIndex(namespace);
    // return namespaces.hasOwnProperty(namespace) ? namespaces[namespace] : null;
  }

  static async addDocumentToNamespace(namespace: string, documentData: any = {}, fullFilePath: string) {
    try {
      const { pageContent, docId, ...metadata } = documentData;
      if (!pageContent || pageContent.length == 0) return false;

      console.log('Adding new vectorized document into namespace', namespace);
      // const cacheResult = await cachedVectorInformation(fullFilePath);

      // if (typeof cacheResult === 'object' && 'exists' in cacheResult && cacheResult.exists) {
      //   // Now TypeScript knows that cacheResult is an object with 'exists' property set to true
      //   // You can access cacheResult.exists safely
      //   const { pineconeIndex } = await this.connect();
      //   const { chunks } = cacheResult;
      //   const documentVectors = [];

      //   for (const chunk of chunks) {
      //     // Before sending to Pinecone and saving the records to our db
      //     // we need to assign the id of each chunk that is stored in the cached file.

      //     const newChunks = chunk.map((chunk: any) => {
      //       const id = uuidv4();
      //       documentVectors.push({ docId, vectorId: id });
      //       return { ...chunk, id };
      //     });

      //     // Push chunks with new ids to pinecone.
      //     await pineconeIndex.upsert({
      //       values: [...chunks],
      //       id: '23',
      //       // upsertRequest: {
      //       //   vectors: [...newChunks],
      //       //   namespace,
      //       // },
      //     });
      //   }
      // }

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 20,
      });
      const textChunks: any[] = await textSplitter.splitText(pageContent);

      console.log('Chunks created from document:', textChunks.length, textChunks);
      const LLMConnector = getLLMProvider();

      const documentVectors = [];
      const vectors = [];
      const vectorValues = await LLMConnector.embedChunks(textChunks);

      if (!!vectorValues && vectorValues.length > 0) {
        for (const [i, vector] of vectorValues.entries()) {
          const vectorRecord = {
            id: uuidv4(),
            values: vector,
            // [DO NOT REMOVE]
            // LangChain will be unable to find your text if you embed manually and dont include the `text` key.
            // https://github.com/hwchase17/langchainjs/blob/2def486af734c0ca87285a48f1a04c057ab74bdf/langchain/src/vectorstores/pinecone.ts#L64
            metadata: { ...metadata, text: textChunks[i] },
          };

          vectors.push(vectorRecord);
          documentVectors.push({ docId, vectorId: vectorRecord.id });
        }
      } else {
        throw new Error('Could not embed document chunks! This document will not be recorded.');
      }

      if (vectors.length > 0) {
        const chunks = [];
        const { pineconeIndex } = await this.connect();
        console.log('Inserting vectorized chunks into Pinecone.');
        for (const chunk of toChunks(vectors, 100)) {
          console.log('Inserting vectorized chunks into Pinecone.');
          chunks.push(chunk);
          // await pineconeIndex.upsert({
          //   upsertRequest: {
          //     vectors: [...chunk],
          //     namespace,
          //   },
          // });
        }
        
      }

      return {
        documentVectors,
        vectors,
      };
    } catch (error) {}
  }
}
