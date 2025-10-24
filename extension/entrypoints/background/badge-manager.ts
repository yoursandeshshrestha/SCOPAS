import type { CouponData } from "./types";
import { BACKGROUND_CONFIG } from "./config";
import { logger } from "./logger";

// ========= Badge Manager - Handles extension icon badge display ========= //
class BadgeManager {
  private tabCoupons = new Map<number, CouponData>();

  async showBadge(tabId: number, couponData: CouponData): Promise<void> {
    try {
      this.tabCoupons.set(tabId, couponData);

      await browser.action.setBadgeText({
        text: couponData.couponCount.toString(),
        tabId,
      });

      await browser.action.setBadgeBackgroundColor({
        color: BACKGROUND_CONFIG.BADGE.BACKGROUND_COLOR,
        tabId,
      });

      const plural = couponData.couponCount > 1 ? "s" : "";
      await browser.action.setTitle({
        title: `${couponData.couponCount} coupon${plural} available for ${couponData.storeName}`,
        tabId,
      });

      logger.log(
        `Badge set for tab ${tabId}: ${couponData.couponCount} coupons`
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error showing badge:", error.message);
      }
    }
  }

  async clearBadge(tabId: number): Promise<void> {
    try {
      this.tabCoupons.delete(tabId);

      await browser.action.setBadgeText({ text: "", tabId });
      await browser.action.setTitle({
        title: BACKGROUND_CONFIG.BADGE.DEFAULT_TITLE,
        tabId,
      });

      logger.log(`Badge cleared for tab ${tabId}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error clearing badge:", error.message);
      }
    }
  }

  getCouponData(tabId: number): CouponData | undefined {
    return this.tabCoupons.get(tabId);
  }

  hasCoupons(tabId: number): boolean {
    return this.tabCoupons.has(tabId);
  }

  removeTab(tabId: number): void {
    this.tabCoupons.delete(tabId);
  }
}

// ========= Export singleton instance ========= //
export const badgeManager = new BadgeManager();
