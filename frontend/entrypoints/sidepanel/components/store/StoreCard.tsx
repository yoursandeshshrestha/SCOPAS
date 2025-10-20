import React, { memo } from "react";
import { Store as StoreIcon } from "lucide-react";
import { Store } from "../types/store.types";

interface StoreCardProps {
  store: Store;
  onClick?: (store: Store) => void;
  index?: number;
}

const StoreCard = memo<StoreCardProps>(({ store, onClick, index = 0 }) => {
  const handleStoreClick = () => {
    if (onClick) onClick(store);
  };

  return (
    <div
      onClick={handleStoreClick}
      className="relative mb-2.5 rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 cursor-pointer hover:border-neutral-600"
      style={{
        animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${
          index * 0.05
        }s backwards`,
      }}
    >
      <div className="p-3.5 px-4">
        <div className="flex justify-between items-center gap-3">
          {/* Left Content - Store Name */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white mb-1 tracking-wide">
              {store.name}
            </div>
            <div className="text-neutral-400 text-sm leading-snug">
              {store.coupons.length} coupon
              {store.coupons.length !== 1 ? "s" : ""} available
            </div>
          </div>

          {/* Right Content - Store Image */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-neutral-700 flex items-center justify-center overflow-hidden">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <StoreIcon size={24} className="text-neutral-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

StoreCard.displayName = "StoreCard";

export default StoreCard;
