import { db } from "../config/database.js";
import { hashPassword, verifyPassword } from "../utils/auth/hash.js";
import { signTokens } from "../utils/auth/jwt.js";
import type { JwtPayload, Tokens, UserInfo } from "../utils/auth/types.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";

export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<Tokens> {
  const existing = await db.users.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Email already in use");

  const passwordHash = await hashPassword(password);
  const user = await db.users.create({
    data: {
      id: cryptoRandomId(),
      email,
      password: passwordHash,
      name,
      provider: "local",
      role: "user",
      isActive: true,
      updatedAt: new Date(),
    },
  });

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const tokens = signTokens(payload);
  const expiresAt = new Date(
    Date.now() + parseTtlToMs(process.env["REFRESH_TOKEN_TTL"] ?? "7d")
  );
  await db.refresh_tokens.create({
    data: {
      id: cryptoRandomId(),
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt,
    },
  });

  const userInfo: UserInfo = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { ...tokens, user: userInfo };
}

export async function signin(email: string, password: string): Promise<Tokens> {
  const user = await db.users.findUnique({ where: { email } });
  if (!user || !user.password)
    throw new UnauthorizedError("Invalid credentials");

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new UnauthorizedError("Invalid credentials");

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const tokens = signTokens(payload);
  const expiresAt = new Date(
    Date.now() + parseTtlToMs(process.env["REFRESH_TOKEN_TTL"] ?? "7d")
  );
  await db.refresh_tokens.create({
    data: {
      id: cryptoRandomId(),
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt,
    },
  });

  const userInfo: UserInfo = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { ...tokens, user: userInfo };
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function logout(refreshToken: string): Promise<void> {
  // Delete the refresh token from the database
  await db.refresh_tokens.deleteMany({
    where: {
      token: refreshToken,
    },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  // Delete all refresh tokens for the user
  await db.refresh_tokens.deleteMany({
    where: {
      userId,
    },
  });
}

function parseTtlToMs(ttl: string): number {
  const match = ttl.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
}
