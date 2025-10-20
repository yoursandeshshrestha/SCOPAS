import { Router } from "express";
import { StoreController } from "../controllers/store.controller.js";

const router = Router();

// Get all stores with optional filters (letter, search) and pagination
router.get("/", StoreController.getAllStores);

// Get store by ID
router.get("/:id", StoreController.getStoreById);

// Get store by name
router.get("/name/:name", StoreController.getStoreByName);

export default router;

