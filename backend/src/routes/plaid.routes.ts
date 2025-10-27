import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createLinkTokenHandler,
  exchangePublicTokenHandler,
  getAccountsHandler,
  disconnectItemHandler,
  syncBalancesHandler,
  getTransactionsHandler,
  syncTransactionsHandler,
  getCreditCardsHandler,
  syncCreditCardsHandler,
  getDataCountsHandler,
  getAllBankAccountsHandler,
  getAllCreditCardsHandler,
  getAllTransactionsHandler,
} from "../controllers/plaid.controller.js";

const router = Router();

// Test routes without authentication
router.get("/test-counts", getDataCountsHandler);
router.get("/test-bank-accounts", getAllBankAccountsHandler);
router.get("/test-credit-cards", getAllCreditCardsHandler);
router.get("/test-transactions", getAllTransactionsHandler);

// All other Plaid routes require authentication
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

// Get user's transactions
router.get("/transactions", getTransactionsHandler);

// Sync transactions from Plaid
router.post("/sync-transactions", syncTransactionsHandler);

// Get user's credit cards
router.get("/credit-cards", getCreditCardsHandler);

// Sync credit cards from Plaid
router.post("/sync-credit-cards", syncCreditCardsHandler);

export default router;
