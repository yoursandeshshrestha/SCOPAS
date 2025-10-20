import OpenAI from "openai";
import { config } from "../config/env.js";

interface DetectionResult {
  success: boolean;
  selector?: string;
  applyButtonSelector?: string;
  message?: string;
}

class SelectorDetectorService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  async detectCouponSelector(
    html: string,
    url: string
  ): Promise<DetectionResult> {
    if (!this.openai) {
      return {
        success: false,
        message: "OpenAI API key not configured",
      };
    }

    try {
      const prompt = `You are an expert web developer and QA engineer specializing in e-commerce checkout page analysis. Your task is to find coupon/promo code input fields with 100% accuracy.

CONTEXT:
- URL: ${url}
- This is a critical production system that must work perfectly
- Users expect instant, reliable coupon application
- False positives or wrong selectors will break the user experience

ANALYSIS TASK:
1. Determine if this is a checkout/cart/bag page with coupon functionality
2. If yes, find the EXACT CSS selectors for:
   - The coupon input field (where users type codes)
   - The apply/check button (if separate from input)

HTML CONTENT (first 50KB):
${html.substring(0, 50000)}

DETECTION RULES - BE EXTREMELY PRECISE:

1. CHECKOUT PAGE VERIFICATION:
   - Look for: "checkout", "cart", "bag", "basket", "order", "payment"
   - URL patterns: /checkout, /cart, /bag, /basket
   - Page elements: "Proceed to payment", "Place order", "Checkout", "Cart"
   - If none found, return {"isCheckoutPage": false}

2. COUPON FIELD DETECTION (in order of priority):
   
   A. ID-BASED SELECTORS (HIGHEST PRIORITY - ALWAYS USE THESE FIRST):
   - Look for: id="coupon-input-field" (Myntra specific - USE THIS IF FOUND)
   - Look for: id="coupon-input", id="promo-code", id="discount-code"
   - Look for: id="voucher-code", id="coupon-code", id="promo"
   - Look for: id="discount", id="coupon", id="voucher"
   - CRITICAL: If you find an ID selector, ALWAYS use it over class selectors
   
   B. NAME-BASED SELECTORS:
   - Look for: name="coupon", name="promo", name="discount", name="voucher"
   - Look for: name="couponCode", name="promoCode", name="discountCode"
   
   C. PLACEHOLDER-BASED SELECTORS:
   - Look for: placeholder="Enter coupon code", placeholder="Promo code"
   - Look for: placeholder="Discount code", placeholder="Voucher code"
   - Look for: placeholder="Coupon code", placeholder="Enter promo code"
   
   D. CLASS-BASED SELECTORS:
   - Look for: class containing "coupon", "promo", "discount", "voucher"
   - Look for: class containing "code", "input", "field"
   
   E. DATA ATTRIBUTE SELECTORS:
   - Look for: data-coupon, data-promo, data-discount, data-voucher
   - Look for: data-testid containing "coupon", "promo", "discount"

3. APPLY BUTTON DETECTION:
   - Look for buttons with text: "Apply", "Check", "Submit", "Use"
   - Look for buttons with data-method: "couponInputApply", "applyCoupon"
   - Look for buttons near the input field
   - Look for buttons with class containing "apply", "check", "submit"
   - Look for buttons with type="submit" in the same form

4. SPECIFIC E-COMMERCE PATTERNS:

   MYNTRA (SPECIFIC INSTRUCTIONS):
   - ALWAYS look for: id="coupon-input-field" FIRST (this is the correct selector)
   - If id="coupon-input-field" exists, use "#coupon-input-field" as selector
   - Look for: data-method="couponInputApply" for button
   - ONLY use class selectors if NO ID is found
   
   FLIPKART:
   - Look for: id="coupon", id="promo-code"
   - Look for: placeholder="Enter coupon code"
   
   AMAZON:
   - Look for: id="spc-gcpromoinput", name="promoCode"
   - Look for: placeholder="Enter code"
   
   AJIO:
   - Look for: id="coupon", id="promo"
   - Look for: class containing "coupon", "promo"

5. VALIDATION REQUIREMENTS:
   - The input must be of type="text" or type="input"
   - The input must be visible and interactive
   - The selector must be unique on the page
   - The selector must be stable (not dynamically generated)

6. RESPONSE FORMAT:
   Return ONLY valid JSON, no markdown:
   - If NOT checkout page: {"isCheckoutPage": false}
   - If checkout but no coupon field: {"isCheckoutPage": true, "inputSelector": null, "applyButtonSelector": null}
   - If coupon field found: {"isCheckoutPage": true, "inputSelector": "exact-css-selector", "applyButtonSelector": "exact-button-selector"}

CRITICAL RULES:
1. ALWAYS prioritize ID selectors over class selectors
2. For Myntra: If you see id="coupon-input-field", ALWAYS use "#coupon-input-field"
3. Use the EXACT selectors from the HTML - do not modify, guess, or approximate
4. Copy the exact ID, class, or attribute values as they appear in the HTML
5. ID selectors are more reliable than class selectors

Return JSON only:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that analyzes HTML to find coupon input fields. Always return valid JSON only, no markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      if (!responseText) {
        return {
          success: false,
          message: "No response from GPT",
        };
      }

      // Parse the JSON response
      let result: {
        isCheckoutPage: boolean;
        inputSelector?: string;
        applyButtonSelector?: string;
      };

      try {
        // Remove markdown code blocks if present
        const cleanedText = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        result = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse GPT response:", responseText);
        return {
          success: false,
          message: "Invalid response format from GPT",
        };
      }

      if (!result.isCheckoutPage) {
        return {
          success: false,
          message: "Are you sure you are on the checkout page?",
        };
      }

      if (!result.inputSelector) {
        return {
          success: false,
          message: "Could not detect coupon input field",
        };
      }

      return {
        success: true,
        selector: result.inputSelector,
        applyButtonSelector: result.applyButtonSelector,
        message: "Coupon input field detected successfully",
      };
    } catch (error) {
      console.error("Error detecting selector:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export const selectorDetectorService = new SelectorDetectorService();
