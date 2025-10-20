import jwt from "jsonwebtoken";
import type { JwtPayload, Tokens } from "./types.js";
import { config } from "../../config/env.js";

export function signTokens(payload: JwtPayload): Tokens {
  const accessToken: string = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTtl,
  });
  const refreshToken: string = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTtl,
  });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
