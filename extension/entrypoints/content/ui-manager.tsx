import ReactDOM from "react-dom/client";
import CouponListPopup from "./components/CouponListPopup";
import NoCouponsPopup from "./components/NoCouponsPopup";
import AutoApplyProgressPopup from "./components/AutoApplyPopup";
import { AutoApplyResultsPopup } from "./components/AutoApplyResultsPopup";
import type { CouponWithStore } from "../sidepanel/types/coupon.types";
import { logger } from "./logger";
import ReopenButton from "./components/ReopenButton";
import popupStyles from "./styles/popup-styles.css?inline";
import reopenButtonStyles from "./styles/reopen-button-styles.css?inline";
import { detectCouponSelector, applyCoupon } from "./auto-apply";

// ========= UI Manager for showing/hiding popups ========= //
class UIManager {
  private root: ReactDOM.Root | null = null;
  private container: HTMLDivElement | null = null;
  private containerShadow: ShadowRoot | null = null;
  private currentView: "list" | "progress" | "results" | null = null;
  private reopenRoot: ReactDOM.Root | null = null;
  private reopenContainer: HTMLDivElement | null = null;
  private reopenShadow: ShadowRoot | null = null;
  private lastCoupons: CouponWithStore[] | null = null;
  private lastStoreName: string | null = null;
  private lastWorkingCoupons: CouponWithStore[] | null = null;

  showCouponList(coupons: CouponWithStore[], storeName: string): void {
    logger.log("Showing coupon list popup");
    this.currentView = "list";
    this.lastCoupons = coupons;
    this.lastStoreName = storeName;
    this.hideReopen();

    // Show NoCouponsPopup if no coupons found
    if (coupons.length === 0) {
      this.render(
        <NoCouponsPopup storeName={storeName} onClose={() => this.hide()} />
      );
      return;
    }

    // Show CouponListPopup if coupons exist
    this.render(
      <CouponListPopup
        coupons={coupons}
        storeName={storeName}
        onClose={() => this.hide()}
        onAutoApply={() => this.showAutoApply(coupons, storeName)}
        onShowWorkingCoupons={
          this.lastWorkingCoupons && this.lastWorkingCoupons.length > 0
            ? () => {
                if (this.lastWorkingCoupons && this.lastStoreName) {
                  this.showResults(this.lastWorkingCoupons, this.lastStoreName);
                }
              }
            : undefined
        }
      />
    );
  }

  showAutoApply(coupons: CouponWithStore[], storeName: string): void {
    logger.log("Showing auto-apply progress popup");
    this.currentView = "progress";
    this.lastCoupons = coupons;
    this.lastStoreName = storeName;
    this.hideReopen();
    this.render(
      <AutoApplyProgressPopup
        coupons={coupons}
        storeName={storeName}
        onClose={() => this.hide()}
        onBack={() => {
          // Go back to coupon list
          if (this.lastCoupons && this.lastStoreName) {
            this.showCouponList(this.lastCoupons, this.lastStoreName);
          }
        }}
        onComplete={(workingCoupons) => {
          logger.log("Auto-apply complete", workingCoupons);
          // Store working coupons for later reference
          this.lastWorkingCoupons = workingCoupons;
          // Show results popup
          this.showResults(workingCoupons, storeName);
        }}
        onDetectSelector={async () => {
          return await detectCouponSelector();
        }}
        onApplyCoupon={async (code, selector, applyButtonSelector) => {
          return await applyCoupon(code, selector, applyButtonSelector);
        }}
      />
    );
  }

  showResults(workingCoupons: CouponWithStore[], storeName: string): void {
    logger.log("Showing auto-apply results popup");
    this.currentView = "results";
    this.render(
      <AutoApplyResultsPopup
        workingCoupons={workingCoupons}
        allCoupons={this.lastCoupons || []}
        storeName={storeName}
        onClose={() => this.hide()}
        onShowAllCoupons={() => {
          // Go back to coupon list
          if (this.lastCoupons && this.lastStoreName) {
            this.showCouponList(this.lastCoupons, this.lastStoreName);
          }
        }}
      />
    );
  }

  hide(): void {
    logger.log("Hiding UI");
    this.currentView = null;

    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
      this.containerShadow = null;
    }

    // Show reopen button only if there are coupons (defer to next tick to avoid layout thrash)
    if (this.lastCoupons && this.lastCoupons.length > 0) {
      setTimeout(() => this.showReopen(), 0);
    }
  }

  private render(component: React.ReactElement): void {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "scopas-popup-root";
      this.container.style.cssText = `
        all: initial;
      `;
      document.body.appendChild(this.container);

      // Attach Shadow DOM and mount React within it
      this.containerShadow = this.container.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = popupStyles;
      const mount = document.createElement("div");
      mount.className = "mount";
      this.containerShadow.appendChild(style);
      this.containerShadow.appendChild(mount);

      this.root = ReactDOM.createRoot(mount);
    }

    this.root!.render(component);
  }

  isShowing(): boolean {
    return this.currentView !== null;
  }

  // Public: show a reopen button with known coupons/store, without opening popup yet
  showReopenFor(coupons: CouponWithStore[], storeName: string): void {
    logger.log("Preparing reopen button for", {
      storeName,
      count: coupons.length,
    });
    this.lastCoupons = coupons;
    this.lastStoreName = storeName;
    this.hideReopen();
    this.showReopen();
  }

  private showReopen(): void {
    if (
      this.reopenContainer ||
      !this.lastCoupons ||
      !this.lastStoreName ||
      this.lastCoupons.length === 0
    ) {
      return;
    }
    logger.log("Rendering reopen button");
    this.reopenContainer = document.createElement("div");
    this.reopenContainer.id = "scopas-reopen-root";
    this.reopenContainer.style.cssText = `
      position: fixed !important;
      top: calc(env(safe-area-inset-top, 0px) + 120px) !important; /* 80px from top */
      bottom: auto !important;
      right: env(safe-area-inset-right, 0px) !important; /* touch right edge, respect safe area */
      left: auto !important;
      transform: none !important;
      z-index: 2147483647 !important;
      all: initial;
      display: block;
      width: auto;
      height: auto;
      pointer-events: auto;
    `;
    document.body.appendChild(this.reopenContainer);

    // Create Shadow DOM for the reopen button host
    this.reopenShadow = this.reopenContainer.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = reopenButtonStyles;
    const mount = document.createElement("div");
    mount.className = "mount";
    this.reopenShadow.appendChild(style);
    this.reopenShadow.appendChild(mount);

    this.reopenRoot = ReactDOM.createRoot(mount);

    try {
      this.reopenRoot.render(
        <ReopenButton
          count={this.lastCoupons!.length}
          onClick={() => {
            this.hideReopen();
            if (this.lastCoupons && this.lastStoreName) {
              this.showCouponList(this.lastCoupons, this.lastStoreName);
            }
          }}
        />
      );
    } catch (e) {
      // Fallback to plain DOM button if React render fails for any reason
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Open coupons");
      btn.title = "Open coupons";
      btn.style.cssText = `
        display:flex;align-items:center;justify-content:center;width:48px;height:48px;
        border-radius:9999px;background:var(--primary, #6366f1);color:white;border:none;
        box-shadow:0 8px 22px rgba(0,0,0,0.35);outline:1px solid rgba(255,255,255,0.12);
        cursor:pointer;
      `;
      btn.textContent = "+";
      btn.onclick = () => {
        this.hideReopen();
        if (this.lastCoupons && this.lastStoreName) {
          this.showCouponList(this.lastCoupons, this.lastStoreName);
        }
      };
      if (this.reopenShadow) {
        this.reopenShadow.appendChild(btn);
      } else {
        this.reopenContainer!.appendChild(btn);
      }
    }
  }

  private hideReopen(): void {
    if (this.reopenRoot) {
      this.reopenRoot.unmount();
      this.reopenRoot = null;
    }
    if (this.reopenContainer) {
      this.reopenContainer.remove();
      this.reopenContainer = null;
      this.reopenShadow = null;
    }
  }
}

// ========= Export singleton instance ========= //
export const uiManager = new UIManager();
