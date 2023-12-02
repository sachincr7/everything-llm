import slugify from 'slugify';
import prisma from '../utils/prisma';
import { WorkspaceUser } from './workspaceUsers';
import { users } from '@prisma/client';
import { Document } from './documents';

export class Workspace {
  static writable = [
    // Used for generic updates so we can validate keys in request body
    'name',
    'slug',
    'vectorTag',
    'openAiTemp',
    'openAiHistory',
    'lastUpdatedAt',
    'openAiPrompt',
  ];

  static async new(name: string, creatorId: number | null = null) {
    let slug = slugify(name, { lower: true });

    const existingBySlug = await this.get({ slug });
    if (existingBySlug !== null) {
      const slugSeed = Math.floor(10000000 + Math.random() * 90000000);
      slug = slugify(`${name}-${slugSeed}`, { lower: true });
    }

    try {
      const workspace = await prisma.workspaces.create({
        data: { name, slug },
      });

      // If created with a user then we need to create the relationship as well.
      // If creating with an admin User it wont change anything because admins can
      // view all workspaces anyway.
      if (!!creatorId) await WorkspaceUser.create(creatorId, workspace.id);
      return { workspace, message: null };
    } catch (error: any) {
      console.error(error.message);
      return { workspace: null, message: error.message };
    }
  }

  static async get(clause = {}) {
    try {
      const workspace = await prisma.workspaces.findFirst({
        where: clause,
        include: {
          documents: true,
        },
      });

      return workspace || null;
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }

  static async update(id: number, data: any) {
    if (!id) throw new Error('No workspace id provided for update');

    const validKeys = Object.keys(data).filter((key) => this.writable.includes(key));
    if (validKeys.length === 0) return { workspace: { id }, message: 'No valid fields to update!' };

    try {
      const workspace = await prisma.workspaces.update({
        where: { id },
        data,
      });
      return { workspace, message: null };
    } catch (error: any) {
      console.error(error.message);
      return { workspace: null, message: error.message };
    }
  }

  static async getWithUser(user: users, clause = {}) {
    if (user?.role === 'admin') return this.get(clause);

    try {
      const workspace = await prisma.workspaces.findFirst({
        where: {
          ...clause,
          workspace_users: {
            some: {
              user_id: user?.id,
            },
          },
          deletedAt: null,
          deletedBy: null,
        },
        include: {
          workspace_users: true,
          documents: true,
        },
      });

      if (!workspace) return null;

      return {
        ...workspace,
        documents: await Document.forWorkspace(workspace.id),
      };
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }

  static async delete(workspaceId: string, adminId: number) {
    try {
      await prisma.workspaces.update({
        where: { id: parseInt(workspaceId) },
        data: {
          deletedAt: new Date(),
          deletedBy: adminId,
        },
      });
      return true;
    } catch (error: any) {
      console.error(error.message);
      return false;
    }
  }

  static async where(clause = {}, limit = null, orderBy = null) {
    try {
      const results = await prisma.workspaces.findMany({
        where: {
          ...clause,
          deletedAt: null,
          deletedBy: null,
        },
        ...(limit !== null ? { take: limit } : {}),
        ...(orderBy !== null ? { orderBy } : {}),
      });
      return results;
    } catch (error: any) {
      console.error(error.message);
      return [];
    }
  }

  static async whereWithUser(user: users, clause = {}, limit = null, orderBy = null) {
    if (user.role === 'admin') return await this.where(clause, limit, orderBy);

    try {
      const workspaces = await prisma.workspaces.findMany({
        where: {
          ...clause,
          workspace_users: {
            some: {
              user_id: user.id,
            },
          },
          deletedAt: null,
          deletedBy: null,
        },
        ...(limit !== null ? { take: limit } : {}),
        ...(orderBy !== null ? { orderBy } : {}),
      });
      return workspaces;
    } catch (error: any) {
      console.error(error.message);
      return [];
    }
  }

  static async updateUsers(userId: string, workspaceId: string, userIds = []) {
    try {
      await WorkspaceUser.delete(userId, workspaceId);
      await WorkspaceUser.createManyUsers(userIds, workspaceId);
      return { success: true, error: null };
    } catch (error: any) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }
}
