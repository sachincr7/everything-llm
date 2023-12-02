import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';

type CreateUserAttr = { username: string; password: string; role: string };

export class UserModel {
  static async create({ username, password, role = 'default' }: CreateUserAttr) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = await prisma.users.create({
        data: {
          username,
          password: hashedPassword,
          role,
        },
      });
      return { user, error: null };
    } catch (error: any) {
      console.error('FAILED TO CREATE USER.', error.message);
      return { user: null, error: error.message };
    }
  }

  static async get(clause = {}) {
    try {
      const user = await prisma.users.findFirst({ where: clause });
      return user ? { ...user } : null;
    } catch (error: any) {
      console.error(error.message);
      return null;
    }
  }

  static async update(userId: string, updates = {}) {
    try {
      await prisma.users.update({
        where: { id: parseInt(userId) },
        data: updates,
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }

  static async delete(userId: string, adminId: number = 99) {
    try {
      await prisma.users.update({
        where: { id: parseInt(userId) },
        data: {
          deletedAt: new Date(),
          deletedBy: adminId,
        },
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }

  static async where(clause = {}, limit = null) {
    try {
      const users = await prisma.users.findMany({
        where: clause,
        ...(limit !== null ? { take: limit } : {}),
      });
      return users;
    } catch (error: any) {
      console.error(error.message);
      return [];
    }
  }
}