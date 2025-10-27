import {
  CountryCode,
  Products,
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
  TransactionsGetRequest,
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

    await prisma.plaid_accounts.createMany({
      data: accountsData,
    });

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

/**
 * Get transactions for user's accounts
 */
export async function getUserTransactions(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    count?: number;
    offset?: number;
  }
) {
  // Default to last 30 days if no dates provided
  const endDate = options?.endDate || new Date();
  const startDate =
    options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get user's accounts
  const accounts = await prisma.plaid_accounts.findMany({
    where: {
      userId,
      ...(options?.accountIds && { accountId: { in: options.accountIds } }),
    },
    include: {
      plaidItem: {
        select: {
          accessToken: true,
          institutionName: true,
        },
      },
    },
  });

  if (accounts.length === 0) {
    return [];
  }

  const allTransactions: any[] = [];

  // Group accounts by access token to minimize API calls
  const accountsByToken = accounts.reduce((acc, account) => {
    const token = account.plaidItem.accessToken!;
    if (!acc[token]) {
      acc[token] = [];
    }
    acc[token].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  const plaidClient = getPlaidClient();

  // Fetch transactions for each access token
  for (const [accessToken, tokenAccounts] of Object.entries(accountsByToken)) {
    try {
      const accountIds = tokenAccounts.map((acc) => acc.accountId);

      const transactionsRequest: TransactionsGetRequest = {
        access_token: accessToken!,
        start_date: startDate!.toISOString().split("T")[0]!, // Format: YYYY-MM-DD
        end_date: endDate!.toISOString().split("T")[0]!, // Format: YYYY-MM-DD
        options: {
          account_ids: accountIds,
          count: options?.count || 100,
          offset: options?.offset || 0,
        },
      };

      const transactionsResponse = await plaidClient.transactionsGet(
        transactionsRequest
      );

      // Process and store transactions
      for (const transaction of transactionsResponse.data.transactions) {
        const account = tokenAccounts.find(
          (acc) => acc.accountId === transaction.account_id
        );
        if (!account) continue;

        // Check if transaction already exists
        const existingTransaction = await prisma.plaid_transactions.findUnique({
          where: { transactionId: transaction.transaction_id },
        });

        if (!existingTransaction) {
          await prisma.plaid_transactions.create({
            data: {
              userId,
              plaidAccountId: account.id,
              transactionId: transaction.transaction_id,
              accountId: transaction.account_id,
              amount: transaction.amount,
              date: new Date(transaction.date),
              name: transaction.name,
              merchantName: transaction.merchant_name || null,
              merchantCategory: transaction.merchant_entity_id || null,
              merchantCategoryCode: transaction.category?.[0] || null,
              paymentChannel: transaction.payment_channel || null,
              pending: transaction.pending,
              transactionType: transaction.transaction_type || null,
              location: transaction.location
                ? JSON.stringify(transaction.location)
                : undefined,
              personalFinanceCategory:
                transaction.personal_finance_category?.primary || null,
              personalFinanceCategoryIcon: null,
              logoUrl: transaction.logo_url || null,
              website: transaction.website || null,
              authorizedDate: transaction.authorized_date
                ? new Date(transaction.authorized_date)
                : null,
              authorizedDatetime: transaction.authorized_datetime
                ? new Date(transaction.authorized_datetime)
                : null,
              datetime: transaction.datetime
                ? new Date(transaction.datetime)
                : null,
            },
          });
        }

        allTransactions.push({
          ...transaction,
          institutionName: account.plaidItem.institutionName,
          accountName: account.name,
        });
      }
    } catch (error) {
      console.error(`Error fetching transactions for token:`, error);
      // Continue with other tokens
    }
  }

  return allTransactions;
}

/**
 * Get transactions from database
 */
export async function getStoredTransactions(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    count?: number;
    offset?: number;
  }
) {
  const whereClause: any = {
    userId,
  };

  // Remove date restrictions to show all transactions
  // if (options?.startDate || options?.endDate) {
  //   whereClause.date = {};
  //   if (options.startDate) whereClause.date.gte = options.startDate;
  //   if (options.endDate) whereClause.date.lte = options.endDate;
  // }

  if (options?.accountIds) {
    whereClause.accountId = { in: options.accountIds };
  }

  const transactions = await prisma.plaid_transactions.findMany({
    where: whereClause,
    include: {
      plaidAccount: {
        include: {
          plaidItem: {
            select: {
              institutionName: true,
            },
          },
        },
      },
    },
    orderBy: { date: "desc" },
    take: options?.count || 50,
    skip: options?.offset || 0,
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    transactionId: transaction.transactionId,
    accountId: transaction.accountId,
    accountName: transaction.plaidAccount.name,
    institutionName: transaction.plaidAccount.plaidItem.institutionName,
    amount: transaction.amount,
    date: transaction.date,
    name: transaction.name,
    merchantName: transaction.merchantName,
    merchantCategory: transaction.merchantCategory,
    merchantCategoryCode: transaction.merchantCategoryCode,
    paymentChannel: transaction.paymentChannel,
    pending: transaction.pending,
    transactionType: transaction.transactionType,
    location: transaction.location
      ? JSON.parse(transaction.location as string)
      : null,
    personalFinanceCategory: transaction.personalFinanceCategory,
    personalFinanceCategoryIcon: transaction.personalFinanceCategoryIcon,
    logoUrl: transaction.logoUrl,
    website: transaction.website,
    authorizedDate: transaction.authorizedDate,
    authorizedDatetime: transaction.authorizedDatetime,
    datetime: transaction.datetime,
  }));
}

/**
 * Sync transactions for user
 */
export async function syncTransactions(userId: string): Promise<void> {
  if (!isPlaidConfigured()) {
    throw new AppError("Plaid is not configured. Please contact support.", 500);
  }

  // Get transactions from a very wide range to catch all test transactions
  const endDate = new Date("2025-12-31"); // Go far into the future
  const startDate = new Date("2020-01-01"); // Go way back

  try {
    const transactions = await getUserTransactions(userId, {
      startDate,
      endDate,
      count: 500, // Get more transactions during sync
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get credit cards for user's accounts
 */
export async function getUserCreditCards(userId: string) {
  const accounts = await prisma.plaid_accounts.findMany({
    where: {
      userId,
      type: "credit", // Only get credit accounts
    },
    include: {
      plaidItem: {
        select: {
          accessToken: true,
          institutionName: true,
        },
      },
      creditCards: true,
    },
  });

  if (accounts.length === 0) {
    return [];
  }

  const allCreditCards: any[] = [];

  // Group accounts by access token to minimize API calls
  const accountsByToken = accounts.reduce((acc, account) => {
    const token = account.plaidItem.accessToken!;
    if (!acc[token]) {
      acc[token] = [];
    }
    acc[token].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  const plaidClient = getPlaidClient();

  // Fetch credit card details for each access token
  for (const [accessToken, tokenAccounts] of Object.entries(accountsByToken)) {
    try {
      const accountIds = tokenAccounts.map((acc) => acc.accountId);

      // For credit cards, we'll use the accounts API to get card details
      const accountsRequest: AccountsGetRequest = {
        access_token: accessToken,
      };
      const accountsResponse = await plaidClient.accountsGet(accountsRequest);

      // Process and store credit card details
      for (const account of accountsResponse.data.accounts) {
        const plaidAccount = tokenAccounts.find(
          (acc) => acc.accountId === account.account_id
        );
        if (!plaidAccount || account.type !== "credit") continue;

        // Check if credit card already exists
        const existingCard = await prisma.credit_cards.findFirst({
          where: {
            accountId: account.account_id,
            userId,
          },
        });

        if (!existingCard) {
          await prisma.credit_cards.create({
            data: {
              userId,
              plaidAccountId: plaidAccount.id,
              accountId: account.account_id,
              cardId: account.account_id, // Use account ID as card ID
              cardName: account.name,
              cardType: account.type,
              cardBrand: account.subtype,
              cardNetwork: account.subtype,
              cardNumber: account.mask || null,
              currentBalance: account.balances.current ?? undefined,
              availableBalance: account.balances.available ?? undefined,
              creditLimit: account.balances.limit ?? undefined,
              currency: account.balances.iso_currency_code || "USD",
              status: "active",
            },
          });
        }

        allCreditCards.push({
          id: account.account_id,
          accountId: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          currentBalance: account.balances.current,
          availableBalance: account.balances.available,
          creditLimit: account.balances.limit,
          currency: account.balances.iso_currency_code || "USD",
          institutionName: plaidAccount.plaidItem.institutionName,
        });
      }
    } catch (error) {
      console.error(`Error fetching credit cards for token:`, error);
      // Continue with other tokens
    }
  }

  return allCreditCards;
}

/**
 * Get credit cards from database
 */
export async function getStoredCreditCards(userId: string) {
  const creditCards = await prisma.credit_cards.findMany({
    where: { userId },
    include: {
      plaidAccount: {
        include: {
          plaidItem: {
            select: {
              institutionName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return creditCards.map((card) => ({
    id: card.id,
    cardId: card.cardId,
    accountId: card.accountId,
    cardName: card.cardName,
    cardType: card.cardType,
    cardBrand: card.cardBrand,
    cardNetwork: card.cardNetwork,
    cardNumber: card.cardNumber,
    expirationMonth: card.expirationMonth,
    expirationYear: card.expirationYear,
    currentBalance: card.currentBalance,
    availableBalance: card.availableBalance,
    creditLimit: card.creditLimit,
    currency: card.currency,
    status: card.status,
    isDefault: card.isDefault,
    institutionName: card.plaidAccount.plaidItem.institutionName,
    createdAt: card.createdAt,
  }));
}

/**
 * Sync credit cards for user
 */
export async function syncCreditCards(userId: string): Promise<void> {
  if (!isPlaidConfigured()) {
    throw new AppError("Plaid is not configured. Please contact support.", 500);
  }

  try {
    await getUserCreditCards(userId);
  } catch (error) {
    throw error;
  }
}

/**
 * Get counts of bank accounts, credit cards, and transactions for a user
 */
export async function getDataCounts(userId: string) {
  try {
    // If userId is "test-user" or not provided, get counts for all data
    const whereClause = userId === "test-user" ? {} : { userId };
    
    // Get count of bank accounts (plaid_accounts)
    const bankAccountsCount = await prisma.plaid_accounts.count({
      where: whereClause,
    });

    // Get count of credit cards
    const creditCardsCount = await prisma.credit_cards.count({
      where: whereClause,
    });

    // Get count of transactions
    const transactionsCount = await prisma.plaid_transactions.count({
      where: whereClause,
    });

    return {
      bankAccounts: bankAccountsCount,
      creditCards: creditCardsCount,
      transactions: transactionsCount,
      total: bankAccountsCount + creditCardsCount + transactionsCount,
    };
  } catch (error) {
    console.error("Error getting data counts:", error);
    throw new AppError("Failed to get data counts", 500);
  }
}

/**
 * Get all bank accounts for a user (test route)
 */
export async function getAllBankAccounts(userId: string) {
  try {
    // If userId is "test-user" or not provided, get all bank accounts
    const whereClause = userId === "test-user" ? {} : { userId };
    
    const bankAccounts = await prisma.plaid_accounts.findMany({
      where: whereClause,
      include: {
        plaidItem: {
          select: {
            institutionName: true,
            institutionId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bankAccounts.map((account) => ({
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
      institutionName: account.plaidItem.institutionName,
      institutionId: account.plaidItem.institutionId,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting all bank accounts:", error);
    throw new AppError("Failed to get bank accounts", 500);
  }
}

/**
 * Get all credit cards for a user (test route)
 */
export async function getAllCreditCards(userId: string) {
  try {
    // If userId is "test-user" or not provided, get all credit cards
    const whereClause = userId === "test-user" ? {} : { userId };
    
    const creditCards = await prisma.credit_cards.findMany({
      where: whereClause,
      include: {
        plaidAccount: {
          include: {
            plaidItem: {
              select: {
                institutionName: true,
                institutionId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return creditCards.map((card) => ({
      id: card.id,
      cardId: card.cardId,
      accountId: card.accountId,
      cardName: card.cardName,
      cardType: card.cardType,
      cardBrand: card.cardBrand,
      cardNetwork: card.cardNetwork,
      cardNumber: card.cardNumber,
      expirationMonth: card.expirationMonth,
      expirationYear: card.expirationYear,
      currentBalance: card.currentBalance,
      availableBalance: card.availableBalance,
      creditLimit: card.creditLimit,
      currency: card.currency,
      status: card.status,
      isDefault: card.isDefault,
      institutionName: card.plaidAccount.plaidItem.institutionName,
      institutionId: card.plaidAccount.plaidItem.institutionId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting all credit cards:", error);
    throw new AppError("Failed to get credit cards", 500);
  }
}

/**
 * Get all transactions for a user (test route)
 */
export async function getAllTransactions(userId: string) {
  try {
    // If userId is "test-user" or not provided, get all transactions
    const whereClause = userId === "test-user" ? {} : { userId };
    
    const transactions = await prisma.plaid_transactions.findMany({
      where: whereClause,
      include: {
        plaidAccount: {
          include: {
            plaidItem: {
              select: {
                institutionName: true,
                institutionId: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      transactionId: transaction.transactionId,
      accountId: transaction.accountId,
      amount: transaction.amount,
      date: transaction.date,
      name: transaction.name,
      merchantName: transaction.merchantName,
      merchantCategory: transaction.merchantCategory,
      merchantCategoryCode: transaction.merchantCategoryCode,
      paymentChannel: transaction.paymentChannel,
      pending: transaction.pending,
      transactionType: transaction.transactionType,
      location: transaction.location,
      personalFinanceCategory: transaction.personalFinanceCategory,
      personalFinanceCategoryIcon: transaction.personalFinanceCategoryIcon,
      logoUrl: transaction.logoUrl,
      website: transaction.website,
      authorizedDate: transaction.authorizedDate,
      authorizedDatetime: transaction.authorizedDatetime,
      datetime: transaction.datetime,
      institutionName: transaction.plaidAccount.plaidItem.institutionName,
      institutionId: transaction.plaidAccount.plaidItem.institutionId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));
  } catch (error) {
    console.error("Error getting all transactions:", error);
    throw new AppError("Failed to get transactions", 500);
  }
}
