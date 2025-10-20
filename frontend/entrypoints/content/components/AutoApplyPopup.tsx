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
    flex: 1,
    minHeight: 0,
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
  buttonContainer: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  } as CSSProperties,
  button: {
    flex: 1,
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  } as CSSProperties,
  primaryButton: {
    backgroundColor: "white",
    color: "#0b0b0d",
  } as CSSProperties,
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: COLORS.primary,
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as CSSProperties,
} as const;

// ========= Types ========= //
type AutoApplyState =
  | "detecting" // Detecting coupon input selector
  | "working" // Applying coupons
  | "success" // Successfully applied
  | "error" // Generic error
  | "not-checkout"; // Not on checkout page

type CouponTestState = "pending" | "testing" | "success" | "error";

interface AutoApplyProgressPopupProps {
  coupons: CouponWithStore[];
  storeName: string;
  onClose: () => void;
  onBack?: () => void;
  onComplete?: (workingCoupons: CouponWithStore[]) => void;
  onDetectSelector: () => Promise<{
    success: boolean;
    selector?: string;
    applyButtonSelector?: string;
    message?: string;
  }>;
  onApplyCoupon: (
    code: string,
    selector: string,
    applyButtonSelector?: string
  ) => Promise<boolean>;
}

// ========= Main Component ========= //
export default function AutoApplyPopup({
  coupons,
  storeName,
  onClose,
  onBack,
  onComplete,
  onDetectSelector,
  onApplyCoupon,
}: AutoApplyProgressPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [state, setState] = useState<AutoApplyState>("detecting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selector, setSelector] = useState<string>("");
  const [applyButtonSelector, setApplyButtonSelector] = useState<
    string | undefined
  >();
  const [couponStates, setCouponStates] = useState<
    Record<string, CouponTestState>
  >({});

  const currentCoupon = coupons[currentIndex];
  const progressPercent = ((currentIndex + 1) / coupons.length) * 100;

  // Step 1: Detect selector on mount
  useEffect(() => {
    const detectAndStart = async () => {
      setState("detecting");
      const result = await onDetectSelector();

      if (!result.success) {
        if (result.message?.toLowerCase().includes("checkout")) {
          setState("not-checkout");
          setErrorMessage(result.message);
        } else {
          setState("error");
          setErrorMessage(
            result.message || "Failed to detect coupon input field"
          );
        }
        return;
      }

      // Successfully detected selector
      setSelector(result.selector!);
      setApplyButtonSelector(result.applyButtonSelector);
      setState("working");
    };

    detectAndStart();
  }, [onDetectSelector]);

  // Step 2: Apply coupons once selector is detected
  useEffect(() => {
    if (state !== "working" || !selector) return;

    const applyCoupons = async () => {
      if (currentIndex >= coupons.length) {
        setIsAnimating(false);
        setState("success");

        // Collect all working coupons
        const workingCoupons = coupons.filter(
          (coupon) => couponStates[coupon.id] === "success"
        );

        setTimeout(() => {
          onComplete?.(workingCoupons);
        }, 1500);
        return;
      }

      const coupon = coupons[currentIndex];
      if (coupon.code) {
        // Set current coupon to testing state
        setCouponStates((prev) => ({
          ...prev,
          [coupon.id]: "testing",
        }));

        const success = await onApplyCoupon(
          coupon.code,
          selector,
          applyButtonSelector
        );

        // Set result state
        setCouponStates((prev) => ({
          ...prev,
          [coupon.id]: success ? "success" : "error",
        }));

        // Wait a bit before trying next coupon
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 2500);
      } else {
        // Skip coupons without code
        setCouponStates((prev) => ({
          ...prev,
          [coupon.id]: "error",
        }));
        setCurrentIndex((prev) => prev + 1);
      }
    };

    applyCoupons();
  }, [
    currentIndex,
    coupons,
    state,
    selector,
    applyButtonSelector,
    onApplyCoupon,
    onComplete,
  ]);

  const requestClose = (): void => {
    setIsVisible(false);
  };

  const handleRetry = async (): Promise<void> => {
    setCurrentIndex(0);
    setErrorMessage("");
    setState("detecting");

    const result = await onDetectSelector();

    if (!result.success) {
      if (result.message?.toLowerCase().includes("checkout")) {
        setState("not-checkout");
        setErrorMessage(result.message);
      } else {
        setState("error");
        setErrorMessage(
          result.message || "Failed to detect coupon input field"
        );
      }
      return;
    }

    // Successfully detected selector
    setSelector(result.selector!);
    setApplyButtonSelector(result.applyButtonSelector);
    setState("working");
  };

  const handleBack = (): void => {
    if (onBack) {
      onBack();
    } else {
      requestClose();
    }
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
              {/* Title & Description - varies by state */}
              {state === "detecting" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "17px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        borderTopColor: "white",
                        animation: "scopas-spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                    <h2
                      style={{
                        ...STYLES.title,
                        margin: 0,
                        lineHeight: "1",
                      }}
                    >
                      Detecting Coupon Field...
                    </h2>
                  </div>
                  <p style={STYLES.description}>
                    Analyzing the page to find where to apply your coupons.
                  </p>
                  <div style={STYLES.progressBarWrapper}>
                    <div
                      style={{
                        ...STYLES.progressBar,
                        width: "50%",
                        animation: "scopas-shimmer 2s ease-in-out infinite",
                      }}
                    />
                  </div>
                </>
              )}

              {state === "working" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "17px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        borderTopColor: "white",
                        animation: "scopas-spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                    <h2
                      style={{
                        ...STYLES.title,
                        margin: 0,
                        lineHeight: "1",
                      }}
                    >
                      Trying Best Coupons for {storeName}
                    </h2>
                  </div>
                  <p style={STYLES.description}>
                    No more wasting time searching for coupons - SCOPAS tests
                    them all for you!
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

                  {/* Coupon List */}
                  <div
                    style={{
                      marginTop: "20px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: COLORS.primaryMuted,
                        marginBottom: "12px",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Testing Coupons:
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column" as const,
                        gap: "6px",
                        flex: 1,
                        overflowY: "auto" as const,
                        minHeight: 0,
                      }}
                    >
                      {coupons.map((coupon, index) => {
                        const couponState =
                          couponStates[coupon.id] || "pending";
                        const isCurrent = index === currentIndex;

                        return (
                          <div
                            key={coupon.id}
                            style={{
                              position: "relative" as const,
                              marginBottom: "4px",
                              borderRadius: "8px",
                              backgroundColor: "var(--bg-secondary, #2a2a2a)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                              ...(isCurrent && {
                                borderColor: "rgba(255, 255, 255, 0.2)",
                                backgroundColor: "rgba(42, 42, 42, 0.95)",
                                boxShadow:
                                  "0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                              }),
                              ...(couponState === "testing" && {
                                opacity: 1,
                                animation:
                                  "scopas-pulse-subtle 1.5s ease-in-out infinite",
                              }),
                            }}
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
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    {/* Status Icon */}
                                    {couponState === "success" && (
                                      <div
                                        style={{
                                          width: "16px",
                                          height: "16px",
                                          borderRadius: "50%",
                                          backgroundColor: COLORS.success,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: "10px",
                                          color: "white",
                                          flexShrink: 0,
                                        }}
                                      >
                                        ✓
                                      </div>
                                    )}
                                    {couponState === "error" && (
                                      <div
                                        style={{
                                          width: "16px",
                                          height: "16px",
                                          borderRadius: "50%",
                                          backgroundColor: "#ef4444",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: "10px",
                                          color: "white",
                                          flexShrink: 0,
                                        }}
                                      >
                                        ✗
                                      </div>
                                    )}
                                    {couponState === "testing" && (
                                      <div
                                        style={{
                                          width: "16px",
                                          height: "16px",
                                          borderRadius: "50%",
                                          border:
                                            "2px solid rgba(255, 255, 255, 0.3)",
                                          borderTopColor: "white",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          animation:
                                            "scopas-spin 0.8s linear infinite",
                                          flexShrink: 0,
                                        }}
                                      />
                                    )}
                                    <div
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "rgb(250 250 250)",
                                        fontFamily: "monospace",
                                        letterSpacing: "0.05em",
                                        transition:
                                          "letter-spacing 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        ...(isCurrent && {
                                          letterSpacing: "0.1em",
                                        }),
                                      }}
                                    >
                                      {coupon.code ||
                                        coupon.details ||
                                        "No code"}
                                    </div>
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
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: COLORS.primaryMuted,
                                    fontWeight: 500,
                                    flexShrink: 0,
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.05)",
                                  }}
                                >
                                  {couponState === "success"
                                    ? "Working"
                                    : couponState === "error"
                                    ? "Invalid"
                                    : couponState === "testing"
                                    ? "Testing..."
                                    : "Pending"}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {state === "not-checkout" && (
                <>
                  <h2 style={STYLES.title}>
                    Are you sure you are on the checkout page?
                  </h2>
                  <p style={STYLES.description}>
                    We couldn't find a coupon input field on this page. Please
                    make sure you're on the checkout or cart page.
                  </p>
                  <div style={STYLES.buttonContainer}>
                    <button
                      onClick={handleBack}
                      style={{
                        ...STYLES.button,
                        ...STYLES.secondaryButton,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.1)";
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRetry}
                      style={{
                        ...STYLES.button,
                        ...STYLES.primaryButton,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e5e5e5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      Try Auto Apply Again
                    </button>
                  </div>
                </>
              )}

              {state === "error" && (
                <>
                  <h2 style={STYLES.title}>Oops! Something went wrong</h2>
                  <p style={STYLES.description}>
                    {errorMessage ||
                      "We couldn't apply coupons automatically. Please try copying and pasting them manually."}
                  </p>
                  <div style={STYLES.buttonContainer}>
                    <button
                      onClick={handleBack}
                      style={{
                        ...STYLES.button,
                        ...STYLES.secondaryButton,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.1)";
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRetry}
                      style={{
                        ...STYLES.button,
                        ...STYLES.primaryButton,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e5e5e5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      Try Auto Apply Again
                    </button>
                  </div>
                </>
              )}

              {state === "success" && (
                <>
                  <h2 style={STYLES.title}>Successfully Applied Coupon!</h2>
                  <p style={STYLES.description}>
                    We've found and applied the best coupon for you. Enjoy your
                    savings!
                  </p>
                  <div style={STYLES.progressBarWrapper}>
                    <div
                      style={{
                        ...STYLES.progressBar,
                        width: "100%",
                        backgroundColor: COLORS.success,
                      }}
                    />
                  </div>
                </>
              )}
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
        @keyframes scopas-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        @keyframes scopas-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes scopas-pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
      `}</style>
    </motion.div>
  );
}
