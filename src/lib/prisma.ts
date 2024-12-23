// serverless prisma
import { PrismaClient } from "@prisma/client";

interface IGlobalThis extends Global {
  prisma?: PrismaClient;
}

export const prisma =
  (globalThis as IGlobalThis).prisma ||
  new PrismaClient({
    /*log: [
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
    ],*/
  });

/*prisma.$on('query', (e: Prisma.QueryEvent) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});*/

if (process.env.NODE_ENV === "development")
  (globalThis as IGlobalThis).prisma = prisma;

export {};
