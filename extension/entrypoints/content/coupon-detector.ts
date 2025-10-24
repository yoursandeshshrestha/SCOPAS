import type { CouponWithStore } from "../sidepanel/types/coupon.types";
import { extractDomain, extractStoreName } from "./utils";
import { couponAPI } from "./api";
import { messagingService } from "./messaging";
import { uiManager } from "./ui-manager";
import { logger } from "./logger";

// ========= Coupon Detection Service ========= //
class CouponDetector {
  private isChecking = false;
  private currentCoupons: CouponWithStore[] | null = null;
  private currentStoreName: string | null = null;

  async checkForCoupons(): Promise<void> {
    if (this.isChecking) {
      logger.warn("Coupon check already in progress");
      return;
    }

    this.isChecking = true;

    try {
      const storeName = this.getCurrentStoreName();

      if (!storeName) {
        logger.log("Could not extract store name from domain, using fallback");
        const fallbackStoreName = "Unlisted Store";
        this.currentStoreName = fallbackStoreName;
        this.currentCoupons = [];
        await messagingService.sendClearBadge();
        // Show the no coupons popup with fallback name
        uiManager.showCouponList([], fallbackStoreName);
        return;
      }

      logger.log(`Checking for coupons for: ${storeName}`);

      const coupons = await this.fetchCoupons(storeName);

      if (coupons.length === 0) {
        logger.log(`No coupons found for ${storeName}`);
        await messagingService.sendClearBadge();
        this.currentCoupons = [];
        this.currentStoreName = storeName;
        // Show the no coupons popup immediately
        uiManager.showCouponList([], storeName);
        return;
      }

      logger.log(`Found ${coupons.length} coupons for ${storeName}`);

      this.currentCoupons = coupons;
      this.currentStoreName = storeName;

      await this.notifyCouponsFound(storeName, coupons);
      // Show a reopen button in the UI so user can open the list on demand
      uiManager.showReopenFor(coupons, storeName);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error during coupon check:", error.message);
      }
    } finally {
      this.isChecking = false;
    }
  }

  showCouponUI(): void {
    if (this.currentCoupons !== null && this.currentStoreName) {
      uiManager.showCouponList(this.currentCoupons, this.currentStoreName);
    } else {
      logger.warn("No coupons available to show");
    }
  }

  private getCurrentStoreName(): string | null {
    try {
      const currentDomain = extractDomain(window.location.href);
      return extractStoreName(currentDomain);
    } catch (error) {
      logger.error("Error extracting store name:", error);
      return null;
    }
  }

  private async fetchCoupons(storeName: string): Promise<CouponWithStore[]> {
    return await couponAPI.fetchCouponsByStoreName(storeName);
  }

  private async notifyCouponsFound(
    storeName: string,
    coupons: CouponWithStore[]
  ): Promise<void> {
    await messagingService.sendCouponsFound(storeName, coupons);
  }
}

// ========= Export singleton instance ========= //
export const couponDetector = new CouponDetector();
