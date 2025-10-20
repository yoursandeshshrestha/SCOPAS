import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

const allowedOrigins: string[] = config.cors.origins;
const allowedMethods: string[] = config.cors.methods.length
  ? config.cors.methods
  : ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const allowedHeaders: string[] = config.cors.headers.length
  ? config.cors.headers
  : ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"];
const allowCredentials: boolean = config.cors.credentials;

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestOrigin = String(req.headers["origin"] || "");
  const originAllowed =
    allowedOrigins.length === 0 ||
    allowedOrigins.includes("*") ||
    (requestOrigin && allowedOrigins.includes(requestOrigin));

  if (allowCredentials) {
    if (originAllowed && requestOrigin) {
      res.header("Access-Control-Allow-Origin", requestOrigin);
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Credentials", "true");
    }
  } else {
    res.header(
      "Access-Control-Allow-Origin",
      originAllowed ? requestOrigin || "*" : "*"
    );
    if (requestOrigin) res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
  res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
}
