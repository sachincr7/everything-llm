import { PrismaClient } from "@prisma/client";

// npx prisma introspect
// npx prisma generate
// npx prisma migrate dev --name init -> ensures that db is in sync with schema
// npx prisma migrate reset -> resets the db

type Options = {
  log: {
    emit: string,
    level: string,
  }[] | {}
}

const options =
  process.env.APP_ENV === 'production'
    ? {}
    : {
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'stdout',
            level: 'error',
          },
          {
            emit: 'stdout',
            level: 'info',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ],
      };

const prisma = new PrismaClient(options as any);

export default prisma;
