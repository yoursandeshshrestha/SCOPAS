import type { CouponWithStore } from "../sidepanel/types/coupon.types";
import type { APIResponse, StoreCouponsAPIResponse } from "./types";
import { CONFIG } from "./config";
import { logger } from "./logger";

// ========= API Service for fetching coupons ========= //
class CouponAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async fetchCouponsByStoreName(storeName: string): Promise<CouponWithStore[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseURL}${CONFIG.API.ENDPOINTS.COUPONS_BY_STORE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: storeName }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn(
          `POST /coupons/by-store failed: ${response.status} ${response.statusText}`
        );
        return await this.fetchFromStoresSearch(storeName);
      }

      const data: APIResponse<StoreCouponsAPIResponse> = await response.json();
      const parsed = this.parseCouponsResponse(data);
      if (parsed.length === 0) {
        return await this.fetchFromStoresSearch(storeName);
      }
      return parsed;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error("Request timeout while fetching coupons");
        } else {
          logger.warn(
            "Error on /coupons/by-store, falling back to /stores?search=",
            error.message
          );
        }
      }
      return await this.fetchFromStoresSearch(storeName);
    }
  }

  private parseCouponsResponse(
    response: APIResponse<StoreCouponsAPIResponse>
  ): CouponWithStore[] {
    if (response.status !== "success" || !response.data) {
      return [];
    }

    // Backend returns { platformName: string[] } of codes. Convert to CouponWithStore (best-effort).
    const results: CouponWithStore[] = [];
    for (const [platformName, codes] of Object.entries(response.data)) {
      if (!Array.isArray(codes)) continue;
      for (const code of codes) {
        results.push({
          id: `${platformName}-${code}`,
          code: code ?? null,
          version: null,
          storeId: "",
          platformId: platformName,
          details: null,
          store: { id: "", name: "", link: "" },
          platform: { id: platformName, name: platformName },
        });
      }
    }
    return results;
  }

  /**
   * Fallback: GET /stores?search=<name> and flatten store.coupons to CouponWithStore[]
   */
  private async fetchFromStoresSearch(
    storeName: string
  ): Promise<CouponWithStore[]> {
    try {
      const url = `${this.baseURL}/stores?search=${encodeURIComponent(
        storeName
      )}&page=1&limit=50`;
      const resp = await fetch(url);
      if (!resp.ok) {
        logger.error(
          `Failed to fetch stores: ${resp.status} ${resp.statusText}`
        );
        return [];
      }
      const json = await resp.json();
      if (json?.status !== "success" || !Array.isArray(json.data)) return [];

      const results: CouponWithStore[] = [];
      for (const store of json.data as Array<any>) {
        const storeId: string = store.id;
        const platformId: string = store.platformId ?? "";
        const storeNameResolved: string = store.name ?? storeName;
        const storeLink: string = store.link ?? "";
        const coupons: Array<any> = Array.isArray(store.coupons)
          ? store.coupons
          : store.coupon ?? [];

        for (const c of coupons) {
          results.push({
            id: String(c.id ?? `${storeId}-${c.code ?? Math.random()}`),
            code: c.code ?? null,
            version: null,
            storeId,
            platformId,
            details: c.details ?? null,
            store: { id: storeId, name: storeNameResolved, link: storeLink },
            platform: { id: platformId, name: "website" },
          });
        }
      }
      return results;
    } catch (e) {
      if (e instanceof Error)
        logger.error("Fallback /stores?search error:", e.message);
      return [];
    }
  }
}

// ========= Export singleton instance ========= //
export const couponAPI = new CouponAPI(CONFIG.API.BASE_URL, CONFIG.API.TIMEOUT);
