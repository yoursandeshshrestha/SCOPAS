import { CSSProperties } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

// ========= Constants & Configuration ========= //
const COLORS = {
  primary: "var(--text-primary, rgb(250 250 250))",
  primaryMuted: "var(--text-muted, rgb(212 212 216))",
  primaryLight: "var(--text-muted-2, rgb(228 228 231))",
} as const;

const CONTENT = {
  brandName: "scopas",
  closeAriaLabel: "Close popup",
} as const;

const STYLES = {
  overlay: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "auto",
    maxWidth: "448px",
    zIndex: 2147483647,
  } as CSSProperties,
  container: {
    width: "100%",
  } as CSSProperties,
  card: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    borderRadius: "16px",
    backdropFilter: "blur(20px) saturate(152%)",
    WebkitBackdropFilter: "blur(20px) saturate(152%)",
    backgroundColor: "var(--bg-dark, #0b0b0d)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow:
      "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
  } as CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "24px 20px 16px 20px",
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
    display: "flex",
    flexDirection: "column" as const,
    padding: "0 20px 20px 20px",
    marginTop: "12px",
    marginBottom: "12px",
  } as CSSProperties,
  textContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  } as CSSProperties,
  title: {
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "1.3",
    color: COLORS.primary,
    margin: "0",
  } as CSSProperties,
  subtitle: {
    fontSize: "14px",
    lineHeight: "1.4",
    color: COLORS.primaryMuted,
    margin: "0",
  } as CSSProperties,
} as const;

// ========= Types ========= //
interface NoCouponsPopupProps {
  storeName: string;
  onClose: () => void;
}

// ========= Main Component ========= //
export default function NoCouponsPopup({
  storeName,
  onClose,
}: NoCouponsPopupProps) {
  return (
    <motion.div
      style={STYLES.overlay}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={STYLES.container}>
        <div style={STYLES.card}>
          {/* Header */}
          <div style={STYLES.header}>
            <span style={STYLES.brandName}>{CONTENT.brandName}</span>
            <button
              onClick={onClose}
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
            <motion.div
              style={STYLES.textContainer}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h2 style={STYLES.title}>
                Sorry! We couldn't find any coupons for {storeName}.
              </h2>
              <p style={STYLES.subtitle}>
                We don't have any active coupons for this store at the moment.
                Please check back later as we're always adding new deals!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
