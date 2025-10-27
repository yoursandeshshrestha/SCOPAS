import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createLinkToken,
  exchangePublicToken,
  getUserPlaidAccounts,
  disconnectPlaidItem,
  syncAccountBalances,
  getUserTransactions,
  getStoredTransactions,
  syncTransactions,
  getUserCreditCards,
  getStoredCreditCards,
  syncCreditCards,
  getDataCounts,
  getAllBankAccounts,
  getAllCreditCards,
  getAllTransactions,
} from "../services/plaid.service.js";

/**
 * POST /api/plaid/create-link-token
 * Create a link token for Plaid Link
 */
export async function createLinkTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const result = await createLinkToken({
      userId: req.user.userId,
      userName: req.user.email,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

const exchangePublicTokenSchema = z.object({
  publicToken: z.string().min(1),
  institutionId: z.string().min(1),
  institutionName: z.string().min(1),
  accounts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      mask: z.string().nullable(),
      type: z.string(),
      subtype: z.string().nullable(),
    })
  ),
});

/**
 * POST /api/plaid/exchange-public-token
 * Exchange public token for access token and store accounts
 */
export async function exchangePublicTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const body = exchangePublicTokenSchema.parse(req.body);

    const result = await exchangePublicToken({
      userId: req.user.userId,
      ...body,
    });

    res.status(200).json({
      status: "success",
      message: "Bank account connected successfully",
      data: result,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        status: "error",
        message: "Invalid input",
        issues: err.flatten(),
      });
      return;
    }
    next(err);
  }
}

/**
 * GET /api/plaid/accounts
 * Get user's connected bank accounts
 */
export async function getAccountsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const accounts = await getUserPlaidAccounts(req.user.userId);

    res.status(200).json({
      status: "success",
      data: accounts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/plaid/disconnect/:itemId
 * Disconnect a bank connection
 */
export async function disconnectItemHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const { itemId } = req.params;

    if (!itemId) {
      res.status(400).json({
        status: "error",
        message: "Item ID is required",
      });
      return;
    }

    await disconnectPlaidItem(req.user.userId, itemId);

    res.status(200).json({
      status: "success",
      message: "Bank connection disconnected successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/plaid/sync-balances
 * Sync account balances from Plaid
 */
export async function syncBalancesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    await syncAccountBalances(req.user.userId);

    res.status(200).json({
      status: "success",
      message: "Account balances synced successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/plaid/transactions
 * Get user's transactions
 */
export async function getTransactionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const {
      startDate,
      endDate,
      accountIds,
      count,
      offset,
      sync = false,
    } = req.query;

    // Parse query parameters
    const options: any = {};
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);
    if (accountIds) options.accountIds = (accountIds as string).split(",");
    if (count) options.count = parseInt(count as string);
    if (offset) options.offset = parseInt(offset as string);

    let transactions;

    if (sync === "true") {
      // Get fresh transactions from Plaid API
      transactions = await getUserTransactions(req.user.userId, options);
    } else {
      // Get stored transactions from database
      transactions = await getStoredTransactions(req.user.userId, options);
    }

    res.status(200).json({
      status: "success",
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/plaid/sync-transactions
 * Sync transactions from Plaid
 */
export async function syncTransactionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    await syncTransactions(req.user.userId);

    res.status(200).json({
      status: "success",
      message: "Transactions synced successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/plaid/credit-cards
 * Get user's credit cards
 */
export async function getCreditCardsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const creditCards = await getStoredCreditCards(req.user.userId);

    res.status(200).json({
      status: "success",
      data: creditCards,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/plaid/sync-credit-cards
 * Sync credit cards from Plaid
 */
export async function syncCreditCardsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    await syncCreditCards(req.user.userId);

    res.status(200).json({
      status: "success",
      message: "Credit cards synced successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/plaid/test-counts
 * Test route to get counts of bank accounts, credit cards, and transactions
 * This route works without authentication for testing purposes
 */
export async function getDataCountsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // For testing purposes, we'll get counts for all users or use a default userId
    // You can modify this to use a specific test user ID if needed
    const testUserId = (req.query["userId"] as string) || "test-user";

    const counts = await getDataCounts(testUserId);

    res.status(200).json({
      status: "success",
      message: "Data counts retrieved successfully",
      data: counts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/plaid/test-bank-accounts
 * Test route to get all bank accounts
 * This route works without authentication for testing purposes
 */
export async function getAllBankAccountsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const testUserId = (req.query["userId"] as string) || "test-user";
    const bankAccounts = await getAllBankAccounts(testUserId);

    res.status(200).json({
      status: "success",
      message: "Bank accounts retrieved successfully",
      data: bankAccounts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/plaid/test-credit-cards
 * Test route to get all credit cards
 * This route works without authentication for testing purposes
 */
export async function getAllCreditCardsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const testUserId = (req.query["userId"] as string) || "test-user";
    const creditCards = await getAllCreditCards(testUserId);

    res.status(200).json({
      status: "success",
      message: "Credit cards retrieved successfully",
      data: creditCards,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/plaid/test-transactions
 * Test route to get all transactions
 * This route works without authentication for testing purposes
 */
export async function getAllTransactionsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const testUserId = (req.query["userId"] as string) || "test-user";
    const transactions = await getAllTransactions(testUserId);

    res.status(200).json({
      status: "success",
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}
