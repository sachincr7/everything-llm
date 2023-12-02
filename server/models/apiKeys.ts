import prisma from "../utils/prisma";

export default class ApiKeys {
  tablename = "api_keys"
  writable = []

  static async get(clause = {}) {
    try {
      const apiKey = await prisma.api_keys.findFirst({ where: clause });
      return apiKey;
    } catch (error: any) {
      console.error("FAILED TO GET API KEY.", error.message);
      return null;
    }
  }
}