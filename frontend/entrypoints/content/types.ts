import type { CouponWithStore } from "../sidepanel/types/coupon.types";

export interface MessageType {
  COUPONS_FOUND: {
    type: "COUPONS_FOUND";
    data: {
      storeName: string;
      coupons: CouponWithStore[];
      couponCount: number;
    };
  };
  CLEAR_BADGE: {
    type: "CLEAR_BADGE";
  };
  SHOW_COUPONS_UI: {
    type: "SHOW_COUPONS_UI";
  };
}

export type ContentMessage =
  | MessageType["COUPONS_FOUND"]
  | MessageType["CLEAR_BADGE"]
  | MessageType["SHOW_COUPONS_UI"];

export interface APIResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface StoreCouponsAPIResponse {
  [platformName: string]: string[];
}
