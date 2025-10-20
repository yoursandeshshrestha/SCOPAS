import express, { Request, Response, NextFunction } from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import { config } from "./config/env.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for frontend communication
app.use(corsMiddleware);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Scopas Backend API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

app.use(`${config.server.basePath}/auth`, authRoutes);
app.use(`${config.server.basePath}/stores`, storeRoutes);
app.use(`${config.server.basePath}/coupons`, couponRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler (Express 5 compatible)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
    status: "error",
  });
});

// Global error handler
app.use(errorHandler);

export default app;
