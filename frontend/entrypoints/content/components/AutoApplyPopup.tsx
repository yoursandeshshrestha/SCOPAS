import { useState, CSSProperties, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
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
  closeAriaLabel: "Close auto-apply popup",
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
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "0 20px 12px 20px",
    overflowY: "auto" as const,
  } as CSSProperties,
  progressSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as CSSProperties,
  title: {
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "1.3",
    color: COLORS.primary,
    marginBottom: 0,
  } as CSSProperties,
  description: {
    fontSize: "14px",
    lineHeight: "1.4",
    color: COLORS.primaryMuted,
    marginTop: 0,
    marginBottom: 0,
  } as CSSProperties,
  progressBarWrapper: {
    width: "100%",
    height: "12px",
    borderRadius: "9999px",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  } as CSSProperties,
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: "9999px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  } as CSSProperties,
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
  } as CSSProperties,
  currentCoupon: {
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: COLORS.primaryMuted,
  } as CSSProperties,
  couponCount: {
    fontSize: "14px",
    fontWeight: 500,
    color: COLORS.primaryMuted,
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
  link: {
    fontSize: "12px",
    textDecoration: "underline",
    fontWeight: 500,
    transition: "opacity 0.2s",
    color: "rgb(238, 238, 238)",
  } as CSSProperties,
} as const;

// ========= Types ========= //
interface AutoApplyProgressPopupProps {
  coupons: CouponWithStore[];
  storeName: string;
  onClose: () => void;
  onComplete?: (bestCoupon: CouponWithStore | null) => void;
}

// ========= Main Component ========= //
export default function AutoApplyPopup({
  coupons,
  storeName,
  onClose,
  onComplete,
}: AutoApplyProgressPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const currentCoupon = coupons[currentIndex];
  const progressPercent = ((currentIndex + 1) / coupons.length) * 100;

  // Simulate testing coupons
  useEffect(() => {
    if (currentIndex >= coupons.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        onComplete?.(coupons[0]); // Return first coupon as "best"
      }, 1000);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentIndex, coupons, onComplete]);

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
            <div style={STYLES.progressSection}>
              {/* Title & Description */}
              <h2 style={STYLES.title}>Trying Best Coupons for {storeName}</h2>
              <p style={STYLES.description}>
                No more wasting time searching for coupons - SCOPAS tests them
                all for you!
              </p>

              {/* Progress Bar */}
              <div style={STYLES.progressBarWrapper}>
                <div
                  style={{
                    ...STYLES.progressBar,
                    width: `${progressPercent}%`,
                    transition: "width 0.3s ease-out",
                    animation: isAnimating
                      ? "scopas-shimmer 2s ease-in-out infinite"
                      : "none",
                  }}
                />
              </div>

              {/* Progress Info */}
              <div style={STYLES.progressInfo}>
                <span style={STYLES.currentCoupon}>
                  {currentCoupon?.code ||
                    currentCoupon?.details ||
                    "Testing..."}
                </span>
                <span style={STYLES.couponCount}>
                  {currentIndex + 1} / {coupons.length} coupons
                </span>
              </div>
            </div>
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
        @keyframes scopas-shimmer {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </motion.div>
  );
}
