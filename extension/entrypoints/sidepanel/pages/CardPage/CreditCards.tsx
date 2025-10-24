import React from "react";
import { CreditCard } from "lucide-react";

export interface CardDetails {
  name: string;
  bank: string;
  last4: string;
  expiryDate: string;
  cardholderName: string;
  cardType: string;
}

// Available credit cards with details
const CREDIT_CARDS: CardDetails[] = [
  {
    name: "SBI Credit Card",
    bank: "State Bank of India",
    last4: "2726",
    expiryDate: "12/25",
    cardholderName: "JOHN DOE",
    cardType: "Visa",
  },
  {
    name: "HDFC Credit Card",
    bank: "HDFC Bank",
    last4: "4892",
    expiryDate: "08/26",
    cardholderName: "JOHN DOE",
    cardType: "Mastercard",
  },
  {
    name: "ICICI Credit Card",
    bank: "ICICI Bank",
    last4: "3154",
    expiryDate: "03/27",
    cardholderName: "JOHN DOE",
    cardType: "Visa",
  },
  {
    name: "American Express",
    bank: "American Express",
    last4: "7891",
    expiryDate: "11/25",
    cardholderName: "JOHN DOE",
    cardType: "Amex",
  },
  {
    name: "Citibank Credit Card",
    bank: "Citibank",
    last4: "5623",
    expiryDate: "06/26",
    cardholderName: "JOHN DOE",
    cardType: "Mastercard",
  },
  {
    name: "Axis Bank Credit Card",
    bank: "Axis Bank",
    last4: "9347",
    expiryDate: "09/27",
    cardholderName: "JOHN DOE",
    cardType: "Visa",
  },
  {
    name: "Kotak Mahindra Credit Card",
    bank: "Kotak Mahindra Bank",
    last4: "1256",
    expiryDate: "04/26",
    cardholderName: "JOHN DOE",
    cardType: "Visa",
  },
  {
    name: "Standard Chartered Credit Card",
    bank: "Standard Chartered",
    last4: "8104",
    expiryDate: "07/28",
    cardholderName: "JOHN DOE",
    cardType: "Mastercard",
  },
];

interface CreditCardsProps {
  domain: string;
  userCards: CardDetails[];
}

export function CreditCards({
  domain,
  userCards,
}: CreditCardsProps): React.ReactElement {
  const allCards = [...userCards, ...CREDIT_CARDS];

  return (
    <div className="w-full space-y-3">
      {allCards.map((card, index) => (
        <div
          key={index}
          className="relative p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all hover:shadow-lg cursor-pointer"
        >
          {/* Card Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/10">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{card.name}</p>
                <p className="text-xs text-gray-400">{card.bank}</p>
              </div>
            </div>
            <div className="text-xs font-semibold text-white/60">
              {card.cardType}
            </div>
          </div>

          {/* Card Number */}
          <div className="mb-4">
            <p className="text-base font-mono text-white tracking-wider">
              •••• •••• •••• {card.last4}
            </p>
          </div>

          {/* Card Footer */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-0.5">
                Cardholder
              </p>
              <p className="text-xs font-medium text-white">
                {card.cardholderName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase mb-0.5">
                Expires
              </p>
              <p className="text-xs font-medium text-white">
                {card.expiryDate}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
