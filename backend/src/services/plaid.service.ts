import {
  CountryCode,
  Products,
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
} from "plaid";
import { getPlaidClient, isPlaidConfigured } from "../config/plaid.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/errors.js";

interface CreateLinkTokenParams {
  userId: string;
  userName?: string;
}

interface ExchangePublicTokenParams {
  userId: string;
  publicToken: string;
  institutionId: string;
  institutionName: string;
  accounts: Array<{
    id: string;
    name: string;
    mask: string | null;
    type: string;
    subtype: string | null;
  }>;
}

/**
 * Create a Plaid Link token for initializing Plaid Link
 */
export async function createLinkToken(
  params: CreateLinkTokenParams
): Promise<{ linkToken: string; expiration: string }> {
  if (!isPlaidConfigured()) {
    throw new AppError("Plaid is not configured. Please contact support.", 500);
  }

  const plaidClient = getPlaidClient();

  const request: LinkTokenCreateRequest = {
    user: {
      client_user_id: params.userId,
    },
    client_name: "Scopas",
    products: [Products.Auth, Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  };

  try {
    const response = await plaidClient.linkTokenCreate(request);
    return {
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
    };
  } catch (error: any) {
    console.error(
      "Error creating Plaid link token:",
      error.response?.data || error
    );
    throw new AppError("Failed to create bank connection link", 500);
  }
}

/**
 * Exchange public token for access token and store in database
 */
export async function exchangePublicToken(
  params: ExchangePublicTokenParams
): Promise<{
  itemId: string;
  institutionName: string;
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    subtype: string | null;
    mask: string | null;
  }>;
}> {
  // Handle test mode - if public token starts with "test_", skip Plaid API call
  if (params.publicToken.startsWith("test_")) {
    console.log("Test mode: Skipping Plaid API call");
    console.log("Test data:", {
      userId: params.userId,
      institutionId: params.institutionId,
      accounts: params.accounts,
    });

    // Store test Plaid item in database
    const plaidItem = await prisma.plaid_items.create({
      data: {
        userId: params.userId,
        itemId: `test_item_${Date.now()}`,
        accessToken: "test_access_token",
        institutionId: params.institutionId,
        institutionName: params.institutionName,
        status: "active",
      },
    });

    console.log("Created Plaid item:", plaidItem);

    // Store test accounts in database
    const accountsData = params.accounts.map((account) => ({
      userId: params.userId,
      plaidItemId: plaidItem.id,
      accountId: account.id,
      name: account.name,
      officialName: account.name,
      type: account.type,
      subtype: account.subtype,
      mask: account.mask,
    }));

    console.log("Creating accounts:", accountsData);

    await prisma.plaid_accounts.createMany({
      data: accountsData,
    });

    console.log("Test accounts created successfully");

    return {
      itemId: plaidItem.itemId,
      institutionName: plaidItem.institutionName,
      accounts: params.accounts,
    };
  }

  if (!isPlaidConfigured()) {
    throw new AppError("Plaid is not configured. Please contact support.", 500);
  }

  const plaidClient = getPlaidClient();

  try {
    // Exchange public token for access token
    const exchangeRequest: ItemPublicTokenExchangeRequest = {
      public_token: params.publicToken,
    };

    const exchangeResponse = await plaidClient.itemPublicTokenExchange(
      exchangeRequest
    );
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Store Plaid item in database
    const plaidItem = await prisma.plaid_items.create({
      data: {
        userId: params.userId,
        itemId: itemId,
        accessToken: accessToken, // TODO: Encrypt this in production
        institutionId: params.institutionId,
        institutionName: params.institutionName,
        status: "active",
      },
    });

    // Store accounts in database
    const accountsData = params.accounts.map((account) => ({
      userId: params.userId,
      plaidItemId: plaidItem.id,
      accountId: account.id,
      name: account.name,
      officialName: account.name,
      type: account.type,
      subtype: account.subtype,
      mask: account.mask,
    }));

    await prisma.plaid_accounts.createMany({
      data: accountsData,
    });

    // Fetch balances (optional - can be done later)
    try {
      const accountsRequest: AccountsGetRequest = {
        access_token: accessToken,
      };
      const accountsResponse = await plaidClient.accountsGet(accountsRequest);

      // Update balances
      for (const account of accountsResponse.data.accounts) {
        await prisma.plaid_accounts.update({
          where: { accountId: account.account_id },
          data: {
            currentBalance: account.balances.current ?? undefined,
            availableBalance: account.balances.available ?? undefined,
            currency: account.balances.iso_currency_code || "USD",
            officialName: account.official_name || account.name,
          },
        });
      }
    } catch (balanceError) {
      console.error("Error fetching balances:", balanceError);
      // Non-critical, continue
    }

    return {
      itemId: plaidItem.itemId,
      institutionName: plaidItem.institutionName,
      accounts: params.accounts,
    };
  } catch (error: any) {
    console.error(
      "Error exchanging public token:",
      error.response?.data || error
    );
    throw new AppError("Failed to connect bank account", 500);
  }
}

/**
 * Get user's connected bank accounts
 */
export async function getUserPlaidAccounts(userId: string) {
  console.log("Getting Plaid accounts for user:", userId);

  const accounts = await prisma.plaid_accounts.findMany({
    where: { userId },
    include: {
      plaidItem: {
        select: {
          institutionName: true,
          institutionId: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("Found accounts:", accounts.length);

  return accounts.map((account) => ({
    id: account.id,
    accountId: account.accountId,
    name: account.name,
    officialName: account.officialName,
    type: account.type,
    subtype: account.subtype,
    mask: account.mask,
    currentBalance: account.currentBalance,
    availableBalance: account.availableBalance,
    currency: account.currency,
    institution: {
      name: account.plaidItem.institutionName,
      id: account.plaidItem.institutionId,
      status: account.plaidItem.status,
    },
    createdAt: account.createdAt,
  }));
}

/**
 * Disconnect a Plaid item (bank connection)
 */
export async function disconnectPlaidItem(
  userId: string,
  itemId: string
): Promise<void> {
  const plaidItem = await prisma.plaid_items.findFirst({
    where: {
      itemId,
      userId,
    },
  });

  if (!plaidItem) {
    throw new AppError("Bank connection not found", 404);
  }

  // Update status to disconnected
  await prisma.plaid_items.update({
    where: { id: plaidItem.id },
    data: { status: "disconnected" },
  });

  // Optionally, remove from Plaid (requires additional API call)
  // For now, we just mark as disconnected in our database
}

/**
 * Sync account balances
 */
export async function syncAccountBalances(userId: string): Promise<void> {
  if (!isPlaidConfigured()) {
    throw new AppError("Plaid is not configured. Please contact support.", 500);
  }

  const plaidClient = getPlaidClient();

  const items = await prisma.plaid_items.findMany({
    where: {
      userId,
      status: "active",
    },
  });

  for (const item of items) {
    try {
      const accountsRequest: AccountsGetRequest = {
        access_token: item.accessToken,
      };
      const accountsResponse = await plaidClient.accountsGet(accountsRequest);

      // Update balances for each account
      for (const account of accountsResponse.data.accounts) {
        await prisma.plaid_accounts.updateMany({
          where: {
            accountId: account.account_id,
            userId,
          },
          data: {
            currentBalance: account.balances.current ?? undefined,
            availableBalance: account.balances.available ?? undefined,
            currency: account.balances.iso_currency_code || "USD",
          },
        });
      }
    } catch (error) {
      console.error(`Error syncing balances for item ${item.itemId}:`, error);
      // Continue with other items
    }
  }
}
