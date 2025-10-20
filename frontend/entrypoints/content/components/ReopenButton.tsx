import { memo } from "react";

interface ReopenButtonProps {
  onClick: () => void;
  count: number;
}

const ReopenButton = memo<ReopenButtonProps>(({ onClick, count }) => {
  return (
    <button
      className="scopas-reopen-btn"
      aria-label="Open coupons"
      title="Open coupons"
      onClick={onClick}
    >
      <div className="scopas-reopen-content">
        <div className="main-circle">
          <span className="scopas-s">S</span>
        </div>
        <div className="coupon-badge">
          <span className="coupon-count">{count}</span>
        </div>
      </div>
    </button>
  );
});

ReopenButton.displayName = "ReopenButton";

export default ReopenButton;
