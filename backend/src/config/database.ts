import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __db__: PrismaClient | undefined;
}

const prismaInstance: PrismaClient =
  globalThis.__db__ ?? new PrismaClient({ log: ["warn", "error"] });

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__db__ = prismaInstance;
}

export { prismaInstance as db };

export async function connectDb(): Promise<void> {
  await prismaInstance.$connect();
}

export async function disconnectDb(): Promise<void> {
  await prismaInstance.$disconnect();
}

export type TransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export async function withTransaction<T>(
  runInTx: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prismaInstance.$transaction(async (tx) => runInTx(tx));
}
