import React, { useState, memo } from "react";
import { Building2, Trash2, Loader2 } from "lucide-react";
import type { ConnectedBankAccount } from "../../../types/plaid.types";

interface BankAccountCardProps {
  account: ConnectedBankAccount;
  onDisconnect: (itemId: string) => void;
  index?: number;
}

export const BankAccountCard = memo<BankAccountCardProps>(
  ({ account, onDisconnect, index = 0 }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDisconnect = async () => {
      if (
        !confirm(
          `Are you sure you want to disconnect ${account.institution.name}?`
        )
      ) {
        return;
      }

      setIsDeleting(true);
      try {
        await onDisconnect(account.institution.id);
      } catch (error) {
        console.error("Error disconnecting account:", error);
      } finally {
        setIsDeleting(false);
      }
    };

    const formatBalance = (balance: number | null) => {
      if (balance === null || balance === undefined) return "N/A";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: account.currency || "USD",
      }).format(balance);
    };

    const getAccountTypeColor = (type: string) => {
      switch (type.toLowerCase()) {
        case "depository":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "credit":
          return "bg-purple-500/20 text-purple-400 border-purple-500/30";
        case "loan":
          return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        case "investment":
          return "bg-green-500/20 text-green-400 border-green-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      }
    };

    return (
      <div
        className="relative mb-2.5 rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 hover:border-neutral-600"
        style={{
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${
            index * 0.05
          }s backwards`,
        }}
      >
        <div className="p-3.5 px-4">
          <div className="flex justify-between items-center gap-3">
            {/* Left Content - Bank Info */}
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-white mb-1 tracking-wide">
                {account.institution.name}
              </div>
              <div className="text-neutral-400 text-sm leading-snug">
                {account.officialName || account.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-neutral-500 text-xs">
                  {account.subtype || account.type}
                </span>
                <span className="text-neutral-500 text-xs">•</span>
                <span className="text-neutral-500 text-xs">
                  ****{account.mask || "0000"}
                </span>
              </div>
            </div>

            {/* Right Content - Balance & Actions */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {account.currentBalance !== null && (
                <div className="text-right">
                  <div className="text-white font-semibold text-sm">
                    {formatBalance(account.currentBalance)}
                  </div>
                  {account.availableBalance !== null &&
                    account.availableBalance !== account.currentBalance && (
                      <div className="text-neutral-400 text-xs">
                        Available: {formatBalance(account.availableBalance)}
                      </div>
                    )}
                </div>
              )}

              <button
                onClick={handleDisconnect}
                disabled={isDeleting}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BankAccountCard.displayName = "BankAccountCard";
