import { memo } from "react";
import { TicketPercent } from "lucide-react";

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
        <div className="row-top">
          <TicketPercent width={16} height={16} />
          <span className="brand">SCOPAS</span>
        </div>
        <div className="row-bottom">
          <span className="count">{count}</span>
          <span className="label">Coupons</span>
        </div>
      </div>
    </button>
  );
});

ReopenButton.displayName = "ReopenButton";

export default ReopenButton;
