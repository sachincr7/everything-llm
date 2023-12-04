import { workspaces } from "@prisma/client";
import { getVectorDbClass } from "../utils/helpers";
import { fileData } from "../utils/files";
import { v4 as uuidv4 } from 'uuid';
import prisma from "../utils/prisma";

export class Document {
  static async addDocuments(workspace: workspaces, additions: string[] = []) {
    const VectorDb = getVectorDbClass();

    if (additions.length === 0) return;

    const embedded = [];
    const failedToEmbed = [];

    for (const path of additions) {
      const data = await fileData(path);
      if (!data) continue;

      const docId: string = uuidv4();
      const { pageContent, ...metadata } = data;
      const newDoc = {
        docId,
        filename: path.split("/")[1],
        docpath: path,
        workspaceId: workspace.id,
        metadata: JSON.stringify(metadata),
      };
      const vectorized = await VectorDb.addDocumentToNamespace(
        workspace.slug,
        { ...data, docId },
        path
      );
      if (!vectorized) {
        console.error("Failed to vectorize", path);
        failedToEmbed.push(path);
        continue;
      }

      try {
        await prisma.workspace_documents.create({ data: newDoc });
        embedded.push(path);
      } catch (error: any) {
        console.error(error.message);
      }

      return { failed: failedToEmbed, embedded };
    }
  }

  static async forWorkspace(workspaceId: number) {
    if (!workspaceId) return [];
    return await prisma.workspace_documents.findMany({
      where: { workspaceId },
    });
  }
}