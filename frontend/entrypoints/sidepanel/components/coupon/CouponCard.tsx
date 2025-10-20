import React, { memo, useState } from "react";
import { Check, Copy, X } from "lucide-react";

export interface CouponCardData {
  code: string;
  description?: string | null;
}

interface CouponCardProps {
  coupon: CouponCardData;
  onCopyCode?: (code: string) => void;
  copiedCode?: string | null;
  index?: number;
}

const CouponCard = memo<CouponCardProps>(
  ({ coupon, onCopyCode, copiedCode, index = 0 }) => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(false);
    const isCopied = copiedCode === coupon.code || copied;

    const handleCopyClick = async (e: React.MouseEvent) => {
      e.stopPropagation();

      try {
        await navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setError(false);

        if (onCopyCode) {
          onCopyCode(coupon.code);
        }

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        setError(true);
        setCopied(false);

        setTimeout(() => {
          setError(false);
        }, 2000);
      }
    };

    return (
      <div
        className="relative mb-2.5 rounded-lg bg-neutral-800 border border-neutral-700 transition-all duration-200 cursor-pointer hover:border-neutral-600"
        style={{
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${
            index * 0.05
          }s backwards`,
        }}
      >
        <div className="p-3.5 px-4">
          <div className="flex justify-between items-center gap-3">
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-white mb-1 font-mono tracking-wide">
                {coupon.code}
              </div>
              <div className="text-neutral-400 text-sm leading-snug overflow-hidden text-ellipsis whitespace-nowrap">
                {coupon.description ||
                  "Use this coupon to get amazing discounts"}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyClick}
              className={`
              bg-transparent border-2 border-dashed text-white px-3.5 py-2 rounded-md
              transition-all duration-200 flex items-center gap-1.5 text-sm font-semibold flex-shrink-0
              ${
                isCopied
                  ? "border-neutral-600 bg-neutral-600"
                  : "border-neutral-500"
              }
              ${error ? "border-neutral-600 bg-neutral-600" : ""}
              hover:border-neutral-600 hover:bg-neutral-750
            `}
            >
              {isCopied ? (
                <>
                  <Check size={14} />
                  <span>Copied</span>
                </>
              ) : error ? (
                <>
                  <X size={14} />
                  <span>Failed</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CouponCard.displayName = "CouponCard";

export default CouponCard;
