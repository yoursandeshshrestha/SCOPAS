import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prismaClient: PrismaClient =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__prisma__ = prismaClient;
}

export { prismaClient as prisma };
