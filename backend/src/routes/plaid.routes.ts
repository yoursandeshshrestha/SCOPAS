import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createLinkTokenHandler,
  exchangePublicTokenHandler,
  getAccountsHandler,
  disconnectItemHandler,
  syncBalancesHandler,
} from "../controllers/plaid.controller.js";

const router = Router();

// All Plaid routes require authentication
router.use(authenticateToken);

// Create link token for Plaid Link
router.post("/create-link-token", createLinkTokenHandler);

// Exchange public token for access token
router.post("/exchange-public-token", exchangePublicTokenHandler);

// Get user's connected accounts
router.get("/accounts", getAccountsHandler);

// Disconnect a bank connection
router.delete("/disconnect/:itemId", disconnectItemHandler);

// Sync account balances
router.post("/sync-balances", syncBalancesHandler);

export default router;

