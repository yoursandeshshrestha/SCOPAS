import apiClient from '../config/api';
import type {
  PlaidLinkTokenResponse,
  ExchangePublicTokenRequest,
  ExchangePublicTokenResponse,
  GetAccountsResponse,
} from '../types/plaid.types';

const PLAID_API = '/plaid';

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
};


