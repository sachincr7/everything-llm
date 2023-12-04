import prisma from '../utils/prisma';

type DocumentRecord = {
  docId: string;
  vectorId: string;
};

export class DocumentVectors {
  static async bulkInsert(
    vectorRecords: DocumentRecord[] = []
  ) {
    if (vectorRecords.length === 0) return;

    try {
      const inserts: any[] = [];
      vectorRecords.forEach((record) => {
        inserts.push(
          prisma.document_vectors.create({
            data: {
              docId: record?.docId,
              vectorId: record.vectorId,
            },
          })
        );
      });
      await prisma.$transaction(inserts);
      return { documentsInserted: inserts.length };
    } catch (error) {
      console.error('Bulk insert failed', error);
      return { documentsInserted: 0 };
    }
  }
}
