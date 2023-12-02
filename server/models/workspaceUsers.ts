import prisma from '../utils/prisma';

export class WorkspaceUser {
  static async create(userId: number, workspaceId: number | null) {
    try {
      await prisma.workspace_users.create({
        data: { user_id: Number(userId), workspace_id: Number(workspaceId) },
      });
      return true;
    } catch (error: any) {
      console.error('FAILED TO CREATE WORKSPACE_USER RELATIONSHIP.', error.message);
      return false;
    }
  }

  static async createManyUsers(userIds = [], workspaceId: string) {
    if (userIds.length === 0) return;
    try {
      await prisma.$transaction(
        userIds.map((userId) =>
          prisma.workspace_users.create({
            data: {
              user_id: Number(userId),
              workspace_id: Number(workspaceId),
            },
          })
        )
      );
    } catch (error: any) {
      console.error(error.message);
    }
    return;
  }

  static async createMany(userId: number, workspaceIds = []) {
    if (workspaceIds.length === 0) return;
    try {
      await prisma.$transaction(
        workspaceIds.map((workspaceId) =>
          prisma.workspace_users.create({
            data: { user_id: userId, workspace_id: workspaceId },
          })
        )
      );
    } catch (error: any) {
      console.error(error.message);
    }
    return;
  }

  static async get(clause = {}) {
    try {
      const result = await prisma.workspace_users.findFirst({ where: clause });
      return result || null;
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }

  static async where(clause = {}, limit = null) {
    try {
      const results = await prisma.workspace_users.findMany({
        where: clause,
        ...(limit !== null ? { take: limit } : {}),
      });
      return results;
    } catch (error: any) {
      console.error(error.message);
      return [];
    }
  }

  static async delete(userId: string, workspaceId: string) {
    try {
      await prisma.workspace_users.updateMany({
        where: {
          workspace_id: parseInt(workspaceId),
          user_id: parseInt(userId),
        },
        data: {
          deletedAt: new Date(),
          deletedBy: parseInt(workspaceId),
        },
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }

  static async count(clause = {}) {
    try {
      const count = await prisma.workspace_users.count({ where: clause });
      return count;
    } catch (error: any) {
      console.error(error.message);
      return 0;
    }
  }
}
