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

/**
 * Transaction data structure
 */
export interface Transaction {
  id: string;
  transactionId: string;
  accountId: string;
  accountName: string;
  institutionName: string;
  amount: number;
  date: string;
  name: string;
  merchantName: string | null;
  merchantCategory: string | null;
  merchantCategoryCode: string | null;
  paymentChannel: string | null;
  pending: boolean;
  transactionType: string | null;
  location: any | null;
  personalFinanceCategory: string | null;
  personalFinanceCategoryIcon: string | null;
  logoUrl: string | null;
  website: string | null;
  authorizedDate: string | null;
  authorizedDatetime: string | null;
  datetime: string | null;
}

/**
 * Get Transactions Response
 */
export interface GetTransactionsResponse {
  status: string;
  data: Transaction[];
}

/**
 * Transaction query options
 */
export interface TransactionQueryOptions {
  startDate?: string;
  endDate?: string;
  accountIds?: string[];
  count?: number;
  offset?: number;
  sync?: boolean;
}

export interface CreditCard {
  id: string;
  cardId: string;
  accountId: string;
  cardName: string;
  cardType?: string;
  cardBrand?: string;
  cardNetwork?: string;
  cardNumber?: string;
  expirationMonth?: number;
  expirationYear?: number;
  currentBalance?: number;
  availableBalance?: number;
  creditLimit?: number;
  currency: string;
  status: string;
  isDefault: boolean;
  institutionName: string;
  createdAt: string;
}

export interface GetCreditCardsResponse {
  status: string;
  data: CreditCard[];
}
