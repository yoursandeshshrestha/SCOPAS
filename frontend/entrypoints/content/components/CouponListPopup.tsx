import { useState, useCallback, memo, CSSProperties } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";
import type { CouponWithStore } from "../../sidepanel/types/coupon.types";

// ========= Constants & Configuration ========= //
const COLORS = {
  primary: "var(--text-primary, rgb(250 250 250))",
  primaryMuted: "var(--text-muted, rgb(212 212 216))",
  primaryLight: "var(--text-muted-2, rgb(228 228 231))",
  success: "var(--success, rgb(34 197 94))",
} as const;

const CONTENT = {
  brandName: "scopas",
  closeAriaLabel: "Close coupon popup",
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
    padding: "24px 24px 16px 24px",
  } as CSSProperties,
  brandName: {
    fontSize: "24px",
    fontWeight: 300,
    letterSpacing: "0.05em",
    color: COLORS.primary,
  } as CSSProperties,
  closeButton: {
    padding: "8px",
    margin: "-8px",
    cursor: "pointer",
    border: "none",
    background: "none",
    transition: "all 0.3s ease-out",
  } as CSSProperties,
  // removed floating close to avoid duplication with header close
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    padding: "0 20px 12px 20px",
    overflowY: "auto" as const,
  } as CSSProperties,
  leftSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  } as CSSProperties,
  title: {
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "1.3",
    color: COLORS.primary,
  } as CSSProperties,
  subtitle: {
    fontSize: "14px",
    lineHeight: "1.4",
    color: COLORS.primaryMuted,
  } as CSSProperties,
  reportButton: {
    fontSize: "14px",
    textDecoration: "underline",
    color: COLORS.primary,
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "opacity 0.2s",
    textAlign: "left" as const,
  } as CSSProperties,
  couponList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  } as CSSProperties,
  couponCard: {
    position: "relative" as const,
    marginBottom: "4px",
    borderRadius: "8px",
    backgroundColor: "var(--bg-secondary, #2a2a2a)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  } as CSSProperties,
  couponCardHover: {
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(42, 42, 42, 0.95)",
    boxShadow:
      "0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  } as CSSProperties,
  couponCardContent: {
    padding: "12px 14px",
  } as CSSProperties,
  couponCardInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  } as CSSProperties,
  couponInfo: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  couponCode: {
    fontSize: "16px",
    fontWeight: 600,
    color: "rgb(250 250 250)",
    marginBottom: "4px",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
    transition: "letter-spacing 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  } as CSSProperties,
  couponCodeHover: {
    letterSpacing: "0.1em",
  } as CSSProperties,
  couponDescription: {
    fontSize: "14px",
    color: "rgb(163 163 163)",
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  } as CSSProperties,
  copyButton: {
    backgroundColor: "transparent",
    border: "2px dashed rgb(82 82 91)",
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
  } as CSSProperties,
  copyButtonCopied: {
    borderColor: "rgb(82 82 91)",
    backgroundColor: "rgb(63 63 70)",
  } as CSSProperties,
  copyButtonHover: {
    borderColor: "rgb(113 113 122)",
    backgroundColor: "rgba(82, 82, 91, 0.45)",
  } as CSSProperties,
  footer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
  } as CSSProperties,
  footerText: {
    fontSize: "12px",
    textAlign: "left" as const,
    color: "rgba(238, 238, 238, 0.7)",
    whiteSpace: "nowrap" as const,
    margin: 0,
  } as CSSProperties,
  footerLink: {
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "rgba(238, 238, 238, 0.7)",
    textDecoration: "none",
    transition: "opacity 0.2s",
  } as CSSProperties,
  link: {
    fontSize: "12px",
    textDecoration: "underline",
    fontWeight: 500,
    transition: "opacity 0.2s",
    color: "rgb(238, 238, 238)",
  } as CSSProperties,
  autoApplyButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: COLORS.primary,
    color: "rgb(17, 17, 17)",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "8px",
    boxSizing: "border-box" as const,
    maxWidth: "100%",
    marginLeft: "4px",
    marginRight: "4px",
    overflow: "hidden",
  } as CSSProperties,
} as const;

// ========= Types ========= //
interface CouponListPopupProps {
  coupons: CouponWithStore[];
  storeName: string;
  onClose: () => void;
  onAutoApply: () => void;
}

interface CouponCardProps {
  coupon: CouponWithStore;
  copiedCode: string | null;
  onCopy: (code: string) => void;
  index?: number;
}

// ========= Coupon Card Component ========= //
const CouponCard = memo<CouponCardProps>(
  ({ coupon, copiedCode, onCopy, index = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const isCopied = copiedCode === coupon.code;
    const [error, setError] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!coupon.code) return;

      try {
        await navigator.clipboard.writeText(coupon.code);
        onCopy(coupon.code);
        setError(false);
      } catch (err) {
        console.error("Failed to copy:", err);
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    };

    // Guard: if nothing to show, skip rendering this card
    if (!coupon.code && !coupon.details) {
      return null;
    }

    const displayCode = coupon.code ?? "No code needed";

    return (
      <div
        style={{
          ...STYLES.couponCard,
          ...(isHovered ? STYLES.couponCardHover : {}),
          animation: `slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${
            index * 0.05
          }s backwards`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={STYLES.couponCardContent}>
          <div style={STYLES.couponCardInner}>
            <div style={STYLES.couponInfo}>
              <div
                style={{
                  ...STYLES.couponCode,
                  ...(isHovered ? STYLES.couponCodeHover : {}),
                  color: coupon.code ? "white" : COLORS.primaryMuted,
                }}
              >
                {displayCode}
              </div>
              {coupon.details && (
                <div style={STYLES.couponDescription}>{coupon.details}</div>
              )}
            </div>
            {coupon.code && (
              <button
                onClick={handleCopy}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{
                  ...STYLES.copyButton,
                  ...(isButtonHovered && !isCopied
                    ? STYLES.copyButtonHover
                    : {}),
                  ...(isCopied ? STYLES.copyButtonCopied : {}),
                }}
              >
                {isCopied ? (
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
);

CouponCard.displayName = "CouponCard";

// ========= Main Component ========= //
export default function CouponListPopup({
  coupons,
  storeName,
  onClose,
  onAutoApply,
}: CouponListPopupProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleCopy = useCallback((code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  // removed report issue button

  const requestClose = (): void => {
    setIsVisible(false);
  };

  return (
    <motion.div
      style={STYLES.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={STYLES.container}>
        <motion.div
          style={STYLES.card}
          initial={{ x: 24, opacity: 0 }}
          animate={isVisible ? { x: 0, opacity: 1 } : { x: 24, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 36,
            mass: 0.9,
          }}
          onAnimationComplete={() => {
            if (!isVisible) onClose();
          }}
        >
          {/* Header */}
          <div style={STYLES.header}>
            <span style={STYLES.brandName}>{CONTENT.brandName}</span>
            <button
              onClick={requestClose}
              style={{
                ...STYLES.closeButton,
                color: COLORS.primaryLight,
              }}
              aria-label={CONTENT.closeAriaLabel}
            >
              <X style={{ width: "24px", height: "24px" }} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div style={STYLES.content}>
            {/* Left Section */}
            <div style={STYLES.leftSection}>
              <h2 style={{ ...STYLES.title, marginBottom: 0 }}>
                Great news! We've found {coupons.length} working{" "}
                {coupons.length === 1 ? "coupon" : "coupons"} for {storeName}.
              </h2>
              <p style={{ ...STYLES.subtitle, marginTop: 0, marginBottom: 0 }}>
                Copy any coupon code below or let us automatically test and
                apply the best one for you.
              </p>
              {/* Move Auto Apply before Report an issue */}
              <button onClick={onAutoApply} style={STYLES.autoApplyButton}>
                Auto-Apply Best Coupon
              </button>
              {/* Report issue removed */}
            </div>

            {/* Right Section - Coupon List */}
            <div style={STYLES.couponList}>
              {coupons.map((coupon, index) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  copiedCode={copiedCode}
                  onCopy={handleCopy}
                  index={index}
                />
              ))}
            </div>

            {/* Auto Apply already shown above near the title */}
          </div>

          {/* Footer */}
          <div style={STYLES.footer}>
            <p style={STYLES.footerText}>
              Follow scopas on{" "}
              <a
                href="https://twitter.com/scopas"
                target="_blank"
                rel="noopener noreferrer"
                style={STYLES.link}
              >
                𝕏
              </a>{" "}
              and{" "}
              <a
                href="https://discord.gg/scopas"
                target="_blank"
                rel="noopener noreferrer"
                style={STYLES.link}
              >
                Discord
              </a>
            </p>
            <a href="#" style={STYLES.link}>
              Leave a review
            </a>
          </div>
        </motion.div>
      </div>

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
    </motion.div>
  );
}
