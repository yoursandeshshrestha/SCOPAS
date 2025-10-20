import OpenAI from "openai";
import { config } from "../config/env.js";

interface ValidationResult {
  success: boolean;
  isValid: boolean;
  message: string;
}

class CouponValidatorService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  /**
   * Uses AI to determine if a coupon was successfully applied based on the HTML
   * Note: This is called ONLY if the modal/input is still visible (didn't close)
   */
  async validateCouponFromHTML(
    couponCode: string,
    html: string
  ): Promise<ValidationResult> {
    if (!this.openai) {
      return {
        success: false,
        isValid: false,
        message: "OpenAI API key not configured",
      };
    }

    try {
      const prompt = `You are a coupon validation expert. Analyze the HTML from a coupon form/modal AFTER clicking the apply button.

Coupon Code: ${couponCode}

HTML (after clicking apply button):
${html.substring(0, 8000)}

Your task:
- Look for error messages or validation feedback in the HTML
- The coupon input field is still visible, which means the modal/form didn't close
- If modal is still open, look for error messages to determine if coupon is invalid
- Determine if the coupon CODE is VALID or INVALID

A coupon is VALID if:
- Message says "couldn't be combined with" or "cannot be used together" (coupon exists, just can't stack)
- Message says "already applied" (coupon is working)
- A success message or discount indicator is present

A coupon is INVALID if:
- Error message found: "expired", "disabled", "not valid", "invalid code"
- Error message: "Sorry, this coupon..."
- Error class with negative message

Common error patterns:
- <div class="errorMessage">Sorry, this coupon has expired.</div>
- <div class="error">Coupon code is not valid</div>
- Elements with class containing "error", "invalid", "fail" with error text

Return ONLY a valid JSON object in this exact format:
{"isValid": true} OR {"isValid": false}

Examples:
- <div class="errorMessage">Sorry, this coupon has expired.</div> → {"isValid": false}
- <div class="errorMessage">Sorry, this Coupon has been disabled.</div> → {"isValid": false}
- <div class="errorMessage">Coupon code is not valid</div> → {"isValid": false}
- <div class="errorMessage">MYNTRASAVE couldn't be combined with MYNTRA300</div> → {"isValid": true}
- Input field still visible but NO error message and NO success message → {"isValid": false}
- Input field still visible with success message or discount → {"isValid": true}

Return JSON only:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a precise JSON response generator. Return only valid JSON, no markdown or explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 50,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      if (!responseText) {
        return {
          success: false,
          isValid: false,
          message: "No response from AI",
        };
      }

      // Parse the JSON response
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const result = JSON.parse(cleanedResponse);

      return {
        success: true,
        isValid: result.isValid === true,
        message: "Validation completed successfully",
      };
    } catch (error) {
      console.error("Error validating coupon:", error);
      return {
        success: false,
        isValid: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export const couponValidatorService = new CouponValidatorService();
