import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createLinkToken,
  exchangePublicToken,
  getUserPlaidAccounts,
  disconnectPlaidItem,
  syncAccountBalances,
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
      userName: req.user.name,
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

