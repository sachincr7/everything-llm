import { Index, IndexMetaStatus, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import { DocumentData, cachedVectorInformation } from '../../files';
import { v4 as uuidv4 } from 'uuid';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getLLMProvider, toChunks } from '../../helpers';
import { DocumentVectors } from '../../../models/vectors';

type PinecodeInstance = {
  client: Pinecone;
  pineconeIndex: Index<RecordMetadata>;
  indexName: string;
};

interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    text: string;
    id: string;
    url: string;
    title: string;
    published: string;
    wordCount: number;
    token_count_estimate: number;
  };
}

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

    const pineconeIndex = client.Index(process.env.PINECONE_INDEX!);
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

  static async addDocumentToNamespace(namespace: string, documentData: DocumentData, fullFilePath: string) {
    try {
      const { pageContent, docId, ...metadata } = documentData;
      if (!pageContent || pageContent.length == 0) return false;

      console.log('Adding new vectorized document into namespace', namespace);

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 20,
      });
      const textChunks = await textSplitter.splitText(pageContent);

      console.log('Chunks created from document:', textChunks.length);
      const LLMConnector = getLLMProvider();

      const documentVectors = [];
      const vectors: VectorRecord[] = [];
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
        const { pineconeIndex } = await this.connect();
        for (const chunk of toChunks<VectorRecord>(vectors, 100)) {
          console.log('Inserting vectorized chunks into Pinecone.');
          pineconeIndex.upsert(
            chunk.map((c) => {
              return {
                id: namespace,
                values: c.values,
              };
            })
          );
        }
      }
      await DocumentVectors.bulkInsert(documentVectors);
      return true;
    } catch (error: any) {
      console.error(error);
      console.error('addDocumentToNamespace', error.message);
      return false;
    }
  }
}
