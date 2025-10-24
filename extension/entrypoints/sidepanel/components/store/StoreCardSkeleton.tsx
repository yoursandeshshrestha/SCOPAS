import React from "react";

const StoreCardSkeleton: React.FC = () => {
  return (
    <div className="relative mb-2.5 rounded-lg bg-neutral-800 border border-neutral-700">
      <div className="p-3.5 px-4">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="h-4 w-40 bg-neutral-700 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-neutral-700 rounded animate-pulse" />
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-neutral-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default StoreCardSkeleton;
