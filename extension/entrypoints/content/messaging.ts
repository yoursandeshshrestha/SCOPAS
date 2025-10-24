import type { CouponWithStore } from "../sidepanel/types/coupon.types";
import type { ContentMessage } from "./types";
import { logger } from "./logger";

// ========= Messaging service for communication with background script ========= //
class MessagingService {
  sendCouponsFound(
    storeName: string,
    coupons: CouponWithStore[]
  ): Promise<void> {
    const message: ContentMessage = {
      type: "COUPONS_FOUND",
      data: {
        storeName,
        coupons,
        couponCount: coupons.length,
      },
    };

    return this.sendMessage(message);
  }

  sendClearBadge(): Promise<void> {
    const message: ContentMessage = {
      type: "CLEAR_BADGE",
    };

    return this.sendMessage(message);
  }

  private async sendMessage(message: ContentMessage): Promise<void> {
    try {
      await browser.runtime.sendMessage(message);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error sending message:", error.message);
      }
    }
  }

  setupMessageListener(
    handler: (message: ContentMessage) => void | Promise<void>
  ): void {
    browser.runtime.onMessage.addListener((message: ContentMessage) => {
      try {
        handler(message);
      } catch (error) {
        if (error instanceof Error) {
          logger.error("Error handling message:", error.message);
        }
      }
    });
  }
}

// ========= Export singleton instance ========= //
export const messagingService = new MessagingService();
