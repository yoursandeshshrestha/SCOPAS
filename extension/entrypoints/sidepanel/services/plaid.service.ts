import apiClient from "../config/api";
import type {
  PlaidLinkTokenResponse,
  ExchangePublicTokenRequest,
  ExchangePublicTokenResponse,
  GetAccountsResponse,
  GetTransactionsResponse,
  TransactionQueryOptions,
  CreditCard,
  GetCreditCardsResponse,
} from "../types/plaid.types";

const PLAID_API = "/plaid";

export const plaidService = {
  /**
   * Create a link token for Plaid Link
   */
  createLinkToken: async (): Promise<PlaidLinkTokenResponse> => {
    const response = await apiClient.post<PlaidLinkTokenResponse>(
      `${PLAID_API}/create-link-token`
    );
    return response.data;
  },

  /**
   * Exchange public token for access token
   */
  exchangePublicToken: async (
    data: ExchangePublicTokenRequest
  ): Promise<ExchangePublicTokenResponse> => {
    const response = await apiClient.post<ExchangePublicTokenResponse>(
      `${PLAID_API}/exchange-public-token`,
      data
    );
    return response.data;
  },

  /**
   * Get user's connected bank accounts
   */
  getAccounts: async (): Promise<GetAccountsResponse> => {
    const response = await apiClient.get<GetAccountsResponse>(
      `${PLAID_API}/accounts`
    );
    return response.data;
  },

  /**
   * Disconnect a bank connection
   */
  disconnectAccount: async (itemId: string): Promise<void> => {
    await apiClient.delete(`${PLAID_API}/disconnect/${itemId}`);
  },

  /**
   * Sync account balances
   */
  syncBalances: async (): Promise<void> => {
    await apiClient.post(`${PLAID_API}/sync-balances`);
  },

  /**
   * Get user's transactions
   */
  getTransactions: async (
    options?: TransactionQueryOptions
  ): Promise<GetTransactionsResponse> => {
    const params = new URLSearchParams();

    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.accountIds)
      params.append("accountIds", options.accountIds.join(","));
    if (options?.count) params.append("count", options.count.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    if (options?.sync) params.append("sync", options.sync.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${PLAID_API}/transactions?${queryString}`
      : `${PLAID_API}/transactions`;

    const response = await apiClient.get<GetTransactionsResponse>(url);
    return response.data;
  },

  /**
   * Sync transactions from Plaid
   */
  syncTransactions: async (): Promise<void> => {
    try {
      await apiClient.post(`${PLAID_API}/sync-transactions`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's credit cards
   */
  getCreditCards: async (): Promise<GetCreditCardsResponse> => {
    const response = await apiClient.get<GetCreditCardsResponse>(
      `${PLAID_API}/credit-cards`
    );
    return response.data;
  },

  /**
   * Sync credit cards from Plaid
   */
  syncCreditCards: async (): Promise<void> => {
    try {
      await apiClient.post(`${PLAID_API}/sync-credit-cards`);
    } catch (error) {
      throw error;
    }
  },
};
