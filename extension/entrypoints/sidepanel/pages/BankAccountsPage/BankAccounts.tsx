import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Building2,
  Receipt,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { plaidService } from "../../services/plaid.service";
import {
  ConnectedBankAccount,
  CreditCard as CreditCardType,
} from "../../types/plaid.types";
import { PlaidLinkButton } from "./components/PlaidLinkButton";
import Navbar from "../../components/layout/Navbar";

const BankAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "bank-accounts" | "credit-cards" | "transactions"
  >("bank-accounts");
  const [accounts, setAccounts] = useState<ConnectedBankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingCreditCards, setSyncingCreditCards] = useState(false);
  const [syncingTransactions, setSyncingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plaidService.getAccounts();
      setAccounts(response.data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditCards = async () => {
    try {
      const response = await plaidService.getCreditCards();
      setCreditCards(response.data);
    } catch (err) {
      console.error("Error fetching credit cards:", err);
    }
  };

  const handleSync = async (type: "transactions" | "credit-cards") => {
    try {
      setSyncing(true);
      if (type === "transactions") {
        await plaidService.syncTransactions();
      } else {
        await plaidService.syncCreditCards();
        await fetchCreditCards();
      }
    } catch (err) {
      console.error(`Error syncing ${type}:`, err);
      alert(`Failed to sync ${type}. Please try again.`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCreditCards();
  }, []);

  const formatCurrency = (amount?: number, currency = "USD") => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return "****";
    return `****${cardNumber.slice(-4)}`;
  };

  const renderBankAccountCard = (account: ConnectedBankAccount) => (
    <div
      key={account.id}
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{account.name}</h3>
          <p className="text-sm text-gray-400">{account.institution.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">
            {formatCurrency(
              account.currentBalance ?? undefined,
              account.currency
            )}
          </p>
          <p className="text-xs text-gray-400">
            {account.type} •••• {account.mask}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-gray-400">Available: </span>
          <span className="text-white font-medium">
            {formatCurrency(account.availableBalance || 0, account.currency)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Status: </span>
          <span className="text-white capitalize">
            {account.institution.status}
          </span>
        </div>
      </div>
    </div>
  );

  const renderCreditCardCard = (card: CreditCardType) => (
    <div
      key={card.id}
      className="relative p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all hover:shadow-lg cursor-pointer"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/10">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{card.cardName}</p>
            <p className="text-xs text-gray-400">{card.institutionName}</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-white/60">Credit Card</div>
      </div>

      {/* Card Number */}
      <div className="mb-4">
        <p className="text-base font-mono text-white tracking-wider">
          •••• •••• •••• {formatCardNumber(card.cardNumber)}
        </p>
        {card.currentBalance !== null && card.currentBalance !== undefined && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">Current Balance</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(card.currentBalance, card.currency)}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase mb-0.5">
            Available Credit
          </p>
          <p className="text-xs font-medium text-white">
            {formatCurrency(card.availableBalance, card.currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase mb-0.5">
            {card.expirationMonth && card.expirationYear ? "Expires" : "Status"}
          </p>
          <p className="text-xs font-medium text-white">
            {card.expirationMonth && card.expirationYear
              ? `${card.expirationMonth.toString().padStart(2, "0")}/${
                  card.expirationYear
                }`
              : card.status}
          </p>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (title: string, description: string) => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-neutral-400">{description}</p>
      </div>
    </div>
  );

  const renderBankAccountsTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-2 text-neutral-400">
            Loading bank accounts...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <span className="ml-2 text-red-400">{error}</span>
        </div>
      );
    }

    if (accounts.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No bank accounts found
            </h3>
            <p className="text-neutral-400 mb-6">
              Connect your bank accounts through Plaid to see them here.
            </p>
            <PlaidLinkButton
              onSuccess={() => {
                fetchAccounts();
                fetchCreditCards();
              }}
              variant="primary"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-3">
        {accounts.map(renderBankAccountCard)}
      </div>
    );
  };

  const renderCreditCardsTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-2 text-neutral-400">Loading credit cards...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <span className="ml-2 text-red-400">{error}</span>
        </div>
      );
    }

    if (creditCards.length === 0) {
      if (accounts.length === 0) {
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No credit cards found
              </h3>
              <p className="text-neutral-400 mb-6">
                Connect your credit cards through Plaid to see them here.
              </p>
              <PlaidLinkButton
                onSuccess={() => {
                  fetchAccounts();
                  fetchCreditCards();
                }}
                variant="primary"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-xs">
            <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No credit cards found
            </h3>
            <p className="text-neutral-400">
              Your credit cards will appear here once you have connected
              accounts.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-3">
        {creditCards.map(renderCreditCardCard)}
      </div>
    );
  };

  const renderTransactionsTab = () => {
    if (accounts.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Receipt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              View All Transactions
            </h3>
            <p className="text-neutral-400 mb-6">
              Access detailed transaction history and analytics.
            </p>
            <PlaidLinkButton
              onSuccess={() => {
                fetchAccounts();
                fetchCreditCards();
              }}
              variant="primary"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-xs">
          <Receipt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No transactions found
          </h3>
          <p className="text-neutral-400">
            Your transaction history will appear here once you have connected
            accounts.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] flex flex-col">
      <Navbar />

      {/* Opaque background under navbar + title */}
      <div className="fixed top-0 left-0 right-0 h-[9.5rem] bg-[var(--bg-dark)] z-30" />

      {/* Header bar */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2">
              <Building2 size={16} />
              Bank Accounts
            </div>
          </div>

          {/* Sync button - only show when accounts are available */}
          {accounts.length > 0 && (
            <button
              onClick={async () => {
                try {
                  setSyncing(true);
                  await plaidService.syncBalances();
                  await plaidService.syncTransactions();
                  await plaidService.syncCreditCards();
                  fetchAccounts();
                  fetchCreditCards();
                } catch (error) {
                  console.error("Sync failed:", error);
                } finally {
                  setSyncing(false);
                }
              }}
              disabled={syncing}
              className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {syncing ? "Syncing..." : "Sync"}
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="fixed top-36 left-0 right-0 z-40 px-6">
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("bank-accounts")}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === "bank-accounts"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab("credit-cards")}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === "credit-cards"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            Credit Cards
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === "transactions"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pt-50 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "bank-accounts" && renderBankAccountsTab()}
          {activeTab === "credit-cards" && renderCreditCardsTab()}
          {activeTab === "transactions" && renderTransactionsTab()}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-dark)] border-t border-gray-700 p-4 z-40">
        <div className="max-w-7xl mx-auto">
          <PlaidLinkButton
            onSuccess={() => {
              fetchAccounts();
              fetchCreditCards();
            }}
            variant="secondary"
            buttonText="Connect More Bank Accounts"
            showIcons={true}
            showExternalLink={false}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
