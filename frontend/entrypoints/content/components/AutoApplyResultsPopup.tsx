import { useState, CSSProperties } from "react";
import { X, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { CouponWithStore } from "../../sidepanel/types/coupon.types";

// ========= Constants & Configuration ========= //
const COLORS = {
  primary: "var(--text-primary, rgb(250 250 250))",
  primaryMuted: "var(--text-muted, rgb(212 212 216))",
  success: "var(--success, rgb(34 197 94))",
  error: "var(--error, rgb(239 68 68))",
} as const;

const STYLES = {
  overlay: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100%",
    width: "100%",
    maxWidth: "448px",
    zIndex: 2147483647,
  } as CSSProperties,
  container: {
    width: "100%",
    height: "100%",
  } as CSSProperties,
  card: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    paddingBottom: 0,
    overflow: "hidden",
    borderRadius: "24px 0 0 24px",
    backdropFilter: "blur(20px) saturate(152%)",
    WebkitBackdropFilter: "blur(20px) saturate(152%)",
    backgroundColor: "var(--bg-dark, #1b1b1b)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  } as CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "24px 24px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  } as CSSProperties,
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: COLORS.primary,
    margin: 0,
  } as CSSProperties,
  closeButton: {
    background: "none",
    border: "none",
    color: COLORS.primaryMuted,
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "all 0.2s",
  } as CSSProperties,
};

interface AutoApplyResultsPopupProps {
  workingCoupons: CouponWithStore[];
  allCoupons: CouponWithStore[];
  storeName: string;
  onClose: () => void;
  onShowAllCoupons: () => void;
}

// CouponCard component with copy functionality - matches CouponListPopup design
function CouponCard({
  coupon,
  index = 0,
}: {
  coupon: CouponWithStore;
  index?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!coupon.code) return;

    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setError(false);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const displayCode = coupon.code ?? "No code needed";

  return (
    <div
      style={{
        position: "relative" as const,
        marginBottom: "4px",
        borderRadius: "8px",
        backgroundColor: "rgba(42, 42, 42, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${
          index * 0.05
        }s backwards`,
        ...(isHovered && {
          boxShadow:
            "0 6px 16px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)",
        }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ padding: "12px 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: COLORS.success, // Green color for valid coupons
                marginBottom: "4px",
                fontFamily: "monospace",
                letterSpacing: isHovered ? "0.1em" : "0.05em", // Expands on hover
                transition: "letter-spacing 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {displayCode}
            </div>
            {coupon.details && (
              <div
                style={{
                  fontSize: "14px",
                  color: "rgb(163 163 163)",
                  lineHeight: "1.4",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {coupon.details}
              </div>
            )}
          </div>
          {/* Copy Button - matches CouponListPopup style */}
          {coupon.code && (
            <button
              onClick={handleCopy}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                backgroundColor: copied
                  ? "rgb(63 63 70)"
                  : isButtonHovered
                  ? "rgba(82, 82, 91, 0.45)"
                  : "transparent",
                border: "2px dashed rgb(82 82 91)",
                borderColor:
                  isButtonHovered && !copied
                    ? "rgb(113 113 122)"
                    : "rgb(82 82 91)",
                color: "rgb(250 250 250)",
                padding: "6px 12px",
                borderRadius: "6px",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: 600,
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              {copied ? (
                <>
                  <Check style={{ width: "14px", height: "14px" }} />
                  <span>Copied</span>
                </>
              ) : error ? (
                <>
                  <X style={{ width: "14px", height: "14px" }} />
                  <span>Failed</span>
                </>
              ) : (
                <>
                  <Copy style={{ width: "14px", height: "14px" }} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AutoApplyResultsPopup({
  workingCoupons,
  allCoupons,
  storeName,
  onClose,
  onShowAllCoupons,
}: AutoApplyResultsPopupProps) {
  const hasWorkingCoupons = workingCoupons.length > 0;

  return (
    <div style={STYLES.overlay}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 36,
          mass: 0.9,
        }}
        style={STYLES.container}
      >
        <div style={STYLES.card}>
          {/* Header */}
          <div style={STYLES.header}>
            <h2 style={STYLES.title}>Auto-Apply Results</h2>
            <button
              onClick={onClose}
              style={STYLES.closeButton}
              aria-label="Close results popup"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              gap: "12px",
              padding: "0 20px 12px 20px",
              overflowY: "auto" as const,
            }}
          >
            {hasWorkingCoupons ? (
              // Success State - Show working coupons
              <>
                {/* Title Section */}
                <div
                  style={{
                    padding: "12px 4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    🎉
                  </div>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      lineHeight: "1.3",
                      color: COLORS.primary,
                      marginBottom: "8px",
                    }}
                  >
                    Great news! We found {workingCoupons.length} working{" "}
                    {workingCoupons.length === 1 ? "coupon" : "coupons"} for{" "}
                    {storeName}.
                  </h2>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.4",
                      color: COLORS.primaryMuted,
                      margin: 0,
                    }}
                  >
                    These coupons have been validated and are ready to use.
                  </p>
                </div>

                {/* Show All Coupons Link */}
                <button
                  onClick={onShowAllCoupons}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.primary,
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: "8px 4px",
                    textAlign: "left" as const,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Show all {allCoupons.length} coupons
                </button>

                {/* Working Coupons List */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: "4px",
                  }}
                >
                  {workingCoupons.map((coupon, index) => (
                    <CouponCard key={coupon.id} coupon={coupon} index={index} />
                  ))}
                </div>
              </>
            ) : (
              // No Working Coupons - Show unfortunate message
              <div
                style={{
                  padding: "12px 4px",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "8px",
                  }}
                >
                  😔
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "1.3",
                    color: COLORS.primary,
                    marginBottom: "8px",
                  }}
                >
                  Unfortunately, we couldn't find any working coupons for{" "}
                  {storeName}.
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.4",
                    color: COLORS.primaryMuted,
                    margin: 0,
                  }}
                >
                  The coupons we tested may be expired, disabled, or not
                  applicable to the items in your cart. Try adding different
                  products or check back later for new offers.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Animations */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
