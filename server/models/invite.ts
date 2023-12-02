import uuidAPIKey from 'uuid-apikey';
import prisma from '../utils/prisma';
import { invites, users } from '@prisma/client';

export class InviteModel {
  static makeCode() {
    return uuidAPIKey.create().apiKey;
  }

  static async create(createdByUserId = 0) {
    try {
      const invite = await prisma.invites.create({
        data: {
          code: this.makeCode(),
          createdBy: createdByUserId,
        },
      });
      return { invite, error: null };
    } catch (error: any) {
      console.error("FAILED TO CREATE INVITE.", error.message);
      return { invite: null, error: error.message };
    }
  }

  static async deactivate(inviteId = null) {
    try {
      await prisma.invites.update({
        where: { id: Number(inviteId) },
        data: { status: "disabled" },
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }

  static async markClaimed (inviteId: number, user: users) {
    try {
      await prisma.invites.update({
        where: { id: Number(inviteId) },
        data: { status: "claimed", claimedBy: user.id },
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }

  static async get(clause = {}): Promise<invites | null> {
    try {
      const invite = await prisma.invites.findFirst({ where: clause });
      return invite || null;
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }

  static async count(clause = {}): Promise<number> {
    try {
      const count = await prisma.invites.count({ where: clause });
      return count;
    } catch (error: any) {
      console.error(error.message);
      return 0;
    }
  }

  static async delete(clause = {}) {
    try {
      await prisma.invites.deleteMany({ where: clause });
      return true;
    } catch (error: any) {
      console.error(error.message);
      return false;
    }
  }

  static async where(clause = {}, limit: number) {
    try {
      const invites = await prisma.invites.findMany({
        where: clause,
        take: limit || undefined,
      });
      return invites;
    } catch (error: any) {
      console.error(error.message);
      return [];
    }
  }
}
