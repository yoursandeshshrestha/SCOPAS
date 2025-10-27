import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Loader2,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreditCards, CardDetails } from "./CreditCards";
import { plaidService } from "../../services/plaid.service";
import type { ConnectedBankAccount } from "../../types/plaid.types";
import { PlaidLinkButton } from "../BankAccountsPage/components/PlaidLinkButton";

const Card: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardDetails[]>([]);
  const [plaidAccounts, setPlaidAccounts] = useState<ConnectedBankAccount[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // You can replace this with actual domain detection logic
  const currentDomain = "amazon.com";

  const fetchPlaidAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plaidService.getAccounts();
      console.log("Plaid accounts response:", response.data);
      setPlaidAccounts(response.data);

      // Convert Plaid accounts to card format for credit cards
      // For testing: show all account types, in production: filter for credit only
      const creditCards = response.data
        .filter(
          (account) =>
            account.type === "credit" || account.type === "depository"
        ) // Include checking for testing
        .map((account) => ({
          name: account.name,
          bank: account.institution.name,
          last4: account.mask || "****",
          expiryDate: "N/A", // Plaid doesn't provide expiry dates
          cardholderName: "N/A", // Plaid doesn't provide cardholder names
          cardType: "Credit Card",
          currentBalance: account.currentBalance,
          availableBalance: account.availableBalance,
          currency: account.currency,
        }));

      // In sandbox, Plaid doesn't provide credit cards, so we'll show mock data
      // Remove this when moving to production
      const mockCreditCards: CardDetails[] = [
        {
          name: "Chase Freedom Unlimited",
          bank: "Chase Bank",
          last4: "1234",
          expiryDate: "12/25",
          cardholderName: "JOHN DOE",
          cardType: "Visa",
          currentBalance: -1250.0,
          availableBalance: 3750.0,
          currency: "USD",
        },
        {
          name: "Capital One Venture",
          bank: "Capital One",
          last4: "5678",
          expiryDate: "08/26",
          cardholderName: "JOHN DOE",
          cardType: "Mastercard",
          currentBalance: -890.0,
          availableBalance: 4110.0,
          currency: "USD",
        },
      ];

      // Use mock data in sandbox, real data in production
      setCards(mockCreditCards);
    } catch (err) {
      console.error("Error fetching Plaid accounts:", err);
      setError("Failed to load credit cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaidAccounts();
  }, []);

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
              <CreditCard size={16} />
              My Cards
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/transactions")}
                className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
              >
                <Receipt size={16} />
                Transactions
              </button>
              <button
                onClick={() => navigate("/credit-cards")}
                className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
              >
                <CreditCard size={16} />
                Credit Cards
              </button>
            </div>

            <PlaidLinkButton
              onSuccess={() => {
                // Refresh the cards list after successful connection
                fetchPlaidAccounts();
              }}
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pt-38 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <span className="ml-2 text-neutral-400">
                Loading credit cards...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span className="ml-2 text-red-400">{error}</span>
            </div>
          ) : cards.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No credit cards found
                </h3>
                <p className="text-neutral-400">
                  In sandbox mode, Plaid doesn't provide credit card data.
                  Connect banks to see checking/savings accounts.
                </p>
              </div>
            </div>
          ) : (
            <CreditCards domain={currentDomain} userCards={cards} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
