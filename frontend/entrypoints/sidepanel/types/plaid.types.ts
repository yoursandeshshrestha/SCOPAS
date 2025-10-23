/**
 * Plaid Link Token Response
 */
export interface PlaidLinkTokenResponse {
  status: string;
  data: {
    linkToken: string;
    expiration: string;
  };
}

/**
 * Plaid Account from metadata
 */
export interface PlaidAccount {
  id: string;
  name: string;
  mask: string | null;
  type: string;
  subtype: string | null;
}

/**
 * Plaid Institution from metadata
 */
export interface PlaidInstitution {
  institution_id: string;
  name: string;
}

/**
 * Exchange Public Token Request
 */
export interface ExchangePublicTokenRequest {
  publicToken: string;
  institutionId: string;
  institutionName: string;
  accounts: PlaidAccount[];
}

/**
 * Exchange Public Token Response
 */
export interface ExchangePublicTokenResponse {
  status: string;
  message: string;
  data: {
    itemId: string;
    institutionName: string;
    accounts: PlaidAccount[];
  };
}

/**
 * Connected Bank Account (from GET /accounts)
 */
export interface ConnectedBankAccount {
  id: string;
  accountId: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  currentBalance: number | null;
  availableBalance: number | null;
  currency: string;
  institution: {
    name: string;
    id: string;
    status: string;
  };
  createdAt: string;
}

/**
 * Get Accounts Response
 */
export interface GetAccountsResponse {
  status: string;
  data: ConnectedBankAccount[];
}

