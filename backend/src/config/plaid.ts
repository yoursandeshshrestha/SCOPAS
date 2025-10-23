import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { config } from "./env.js";

let plaidClient: PlaidApi | null = null;

/**
 * Initialize and return Plaid client
 */
export function getPlaidClient(): PlaidApi {
  if (!plaidClient) {
    if (!config.plaid.clientId || !config.plaid.secret) {
      throw new Error(
        "Plaid credentials not configured. Please set PLAID_CLIENT_ID and PLAID_SECRET environment variables."
      );
    }

    const configuration = new Configuration({
      basePath: PlaidEnvironments[config.plaid.env],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": config.plaid.clientId,
          "PLAID-SECRET": config.plaid.secret,
        },
      },
    });

    plaidClient = new PlaidApi(configuration);
  }

  return plaidClient;
}

/**
 * Check if Plaid is configured
 */
export function isPlaidConfigured(): boolean {
  return !!(config.plaid.clientId && config.plaid.secret);
}

