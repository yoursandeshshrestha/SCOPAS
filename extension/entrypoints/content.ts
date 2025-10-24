import { couponDetector } from "./content/coupon-detector";
import { messagingService } from "./content/messaging";
import { logger } from "./content/logger";
import { CONFIG } from "./content/config";
import type { ContentMessage } from "./content/types";

// ========= Initialize coupon detection when DOM is ready ========= //
function initializeCouponDetection(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      couponDetector.checkForCoupons()
    );
  } else {
    couponDetector.checkForCoupons();
  }
}

// ========= Handle messages from background script ========= //
function handleMessage(message: ContentMessage): void {
  switch (message.type) {
    case "SHOW_COUPONS_UI":
      logger.log("Showing coupons UI");
      couponDetector.showCouponUI();
      break;
    default:
      logger.warn("Unknown message type:", message);
  }
}

// ========= Main content script entry point ========= //
export default defineContentScript({
  matches: [...CONFIG.MATCHES.INCLUDE],
  excludeMatches: [...CONFIG.MATCHES.EXCLUDE],

  main() {
    logger.log("Content script loaded on:", window.location.href);

    // Initialize coupon detection
    initializeCouponDetection();

    // Setup message listener
    messagingService.setupMessageListener(handleMessage);
  },
});
