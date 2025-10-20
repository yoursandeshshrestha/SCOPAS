import React, { useState, useEffect } from "react";
import Progress from "../../components/ui/Progress";

interface Category {
  category: string;
  savings: number;
  percentage: number;
}

interface SavingsMonth {
  month: string;
  savings: number;
  coupons: number;
  cards: number;
}

interface InsightsData {
  totalSavings?: number;
  monthlySavings?: number;
  savingsGoal?: number;
  savingsProgress?: number;
  topCategories?: Category[];
}

const SavingsInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData>({});
  const [savingsHistory, setSavingsHistory] = useState<SavingsMonth[]>([]);

  useEffect(() => {
    // Mock data for insights
    const mockInsights: InsightsData = {
      totalSavings: 245.67,
      monthlySavings: 89.34,
      savingsGoal: 500,
      savingsProgress: 49.1,
      topCategories: [
        { category: "Shopping", savings: 89.5, percentage: 36.4 },
        { category: "Dining", savings: 67.25, percentage: 27.4 },
        { category: "Gas", savings: 45.0, percentage: 18.3 },
        { category: "Entertainment", savings: 43.92, percentage: 17.9 },
      ],
    };

    const mockSavingsHistory: SavingsMonth[] = [
      { month: "January", savings: 89.34, coupons: 45.2, cards: 44.14 },
      { month: "December", savings: 78.45, coupons: 38.9, cards: 39.55 },
      { month: "November", savings: 92.15, coupons: 52.3, cards: 39.85 },
      { month: "October", savings: 67.8, coupons: 35.2, cards: 32.6 },
    ];

    setInsights(mockInsights);
    setSavingsHistory(mockSavingsHistory);
  }, []);

  return (
    <div className="w-full space-y-2.5">
      {/* Savings Goal */}
      <div
        className="relative rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 hover:border-neutral-600"
        style={{
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0s backwards`,
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Savings Goal</span>
            <span className="text-sm text-neutral-400">
              ${insights.totalSavings?.toFixed(2)} / ${insights.savingsGoal}
            </span>
          </div>
          <Progress value={insights.savingsProgress} className="mb-2" />
          <p className="text-sm text-neutral-400">
            {insights.savingsProgress?.toFixed(1)}% of annual goal
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 gap-2.5"
        style={{
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s backwards`,
        }}
      >
        <div className="relative rounded-lg bg-neutral-800 border border-neutral-700 p-4 transition-all duration-200 hover:border-neutral-600">
          <span className="text-sm text-neutral-400">Monthly</span>
          <p className="text-xl font-semibold text-white mt-1">
            ${insights.monthlySavings?.toFixed(2)}
          </p>
        </div>
        <div className="relative rounded-lg bg-neutral-800 border border-neutral-700 p-4 transition-all duration-200 hover:border-neutral-600">
          <span className="text-sm text-neutral-400">Total Saved</span>
          <p className="text-xl font-semibold text-white mt-1">
            ${insights.totalSavings?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div
        className="relative rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 hover:border-neutral-600"
        style={{
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards`,
        }}
      >
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Top Categories</h3>
          <div className="space-y-2.5">
            {insights.topCategories?.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-neutral-400">{category.category}</span>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    ${category.savings.toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div
        className="relative rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 hover:border-neutral-600"
        style={{
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards`,
        }}
      >
        <div className="p-4">
          <h3 className="text-white font-semibold mb-3">Recent History</h3>
          <div className="space-y-2.5">
            {savingsHistory.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-white">{month.month}</p>
                  <div className="flex gap-3 text-xs text-neutral-500 mt-0.5">
                    <span>Coupons ${month.coupons.toFixed(2)}</span>
                    <span>Cards ${month.cards.toFixed(2)}</span>
                  </div>
                </div>
                <p className="font-semibold text-white">
                  ${month.savings.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsInsights;
