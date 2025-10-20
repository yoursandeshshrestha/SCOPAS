export interface CouponData {
  storeName: string;
  coupons: unknown[];
  couponCount: number;
}

export interface BackgroundMessage {
  type: "COUPONS_FOUND" | "CLEAR_BADGE";
  data?: CouponData;
}

export interface BadgeConfig {
  text: string;
  backgroundColor: string;
  title: string;
}

