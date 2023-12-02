import path from 'path';
import fs from 'fs';
import { v5 as uuidv5 } from 'uuid';

export type DocumentData = {
  id: string,
  url: string,
  title: string,
  published: string,
  wordCount: number,
  pageContent: string,
  token_count_estimate: number
  docId?: string
}

// Should take in a folder that is a subfolder of documents
// eg: youtube-subject/video-123.json
async function fileData(filePath: string): Promise<DocumentData | null> {
  if (!filePath) throw new Error('No docPath provided in request');

  const fullPath =
    process.env.NODE_ENV === 'development'
      ? path.resolve(__dirname, `../../../storage/documents/${filePath}`)
      : path.resolve(process.env.STORAGE_DIR!, `documents/${filePath}`);

  const fileExists = fs.existsSync(fullPath);
  if (!fileExists) return null;

  const data = fs.readFileSync(fullPath, 'utf8');
  const parsedData: DocumentData = JSON.parse(data);
  return parsedData;
}

// Searches the vector-cache folder for existing information so we dont have to re-embed a
// document and can instead push directly to vector db.
async function cachedVectorInformation(
  filename: string,
  checkOnly = false
): Promise<
  | boolean
  | {
      exists: boolean;
      chunks: any;
    }
> {
  if (!process.env.CACHE_VECTORS) return checkOnly ? false : { exists: false, chunks: [] };

  if (!filename) return checkOnly ? false : { exists: false, chunks: [] };

  const digest = uuidv5(filename, uuidv5.URL);
  const file =
    process.env.NODE_ENV === 'development'
      ? path.resolve(__dirname, `../../storage/vector-cache/${digest}.json`)
      : path.resolve(process.env.STORAGE_DIR!, `vector-cache/${digest}.json`);
  const exists = fs.existsSync(file);

  if (checkOnly) return exists;
  if (!exists) return { exists, chunks: [] };

  console.log(`Cached vectorized results of ${filename} found! Using cached data to save on embed costs.`);
  const rawData = fs.readFileSync(file, 'utf8');
  return { exists: true, chunks: JSON.parse(rawData) };
}

export { fileData, cachedVectorInformation };
