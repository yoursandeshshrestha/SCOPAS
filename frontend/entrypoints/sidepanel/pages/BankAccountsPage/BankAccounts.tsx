import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { plaidService } from "../../services/plaid.service";
import type { ConnectedBankAccount } from "../../types/plaid.types";
import { PlaidLinkButton } from "./components/PlaidLinkButton";
import { BankAccountCard } from "./components/BankAccountCard";
import {
  Building2,
  Loader2,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const BankAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<ConnectedBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDisconnect = async (itemId: string) => {
    try {
      await plaidService.disconnectAccount(itemId);
      // Refresh accounts list
      await fetchAccounts();
    } catch (err) {
      console.error("Error disconnecting account:", err);
      alert("Failed to disconnect account. Please try again.");
    }
  };

  const handleSyncBalances = async () => {
    try {
      setSyncing(true);
      await plaidService.syncBalances();
      // Refresh accounts to show updated balances
      await fetchAccounts();
    } catch (err) {
      console.error("Error syncing balances:", err);
      alert("Failed to sync balances. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      return total + (account.currentBalance || 0);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
          {accounts.length > 0 && (
            <button
              onClick={handleSyncBalances}
              disabled={syncing}
              className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pt-38 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Total Balance Card */}
          {!loading && accounts.length > 0 && (
            <div className="mb-6">
              <div className="relative mb-2.5 rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200">
                <div className="p-3.5 px-4">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-white mb-1 tracking-wide">
                        Total Balance
                      </div>
                      <div className="text-neutral-400 text-sm leading-snug">
                        {formatCurrency(calculateTotalBalance())}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end justify-start">
                      <div className="text-neutral-500 text-xs">
                        {accounts.length} connected{" "}
                        {accounts.length === 1 ? "account" : "accounts"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-neutral-700"></div>
                <div className="px-3 text-neutral-500 text-xs">
                  Connected Accounts
                </div>
                <div className="flex-1 h-px bg-neutral-700"></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-white/20 mb-4" />
              <p className="text-white/40">Loading bank accounts...</p>
            </div>
          ) : (
            <>
              {/* Connect Button - Only show when no accounts */}
              {accounts.length === 0 && (
                <div className="mb-6">
                  <PlaidLinkButton onSuccess={fetchAccounts} />
                </div>
              )}

              {/* Accounts List */}
              {accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                    <Building2 className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Bank Accounts Connected
                  </h3>
                  <p className="text-neutral-400 text-center max-w-md">
                    Connect your bank account to track your spending, manage
                    budgets, and get personalized coupon recommendations based
                    on your transactions.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-0">
                    {accounts.map((account, index) => (
                      <BankAccountCard
                        key={account.id}
                        account={account}
                        onDisconnect={handleDisconnect}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* Add More Banks Button */}
                  <div className="mt-6 pt-4 border-t border-gray-800/50">
                    <PlaidLinkButton
                      onSuccess={fetchAccounts}
                      buttonText="Add More Banks"
                      variant="secondary"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccounts;
