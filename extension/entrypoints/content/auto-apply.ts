import { CONFIG } from "./config";
import { logger } from "./logger";

export interface SelectorDetectionResult {
  success: boolean;
  selector?: string;
  applyButtonSelector?: string;
  message?: string;
}

/**
 * Captures the current page HTML
 */
export function capturePageHTML(): string {
  return document.documentElement.outerHTML;
}

/**
 * Sends HTML to backend for selector detection
 */
export async function detectCouponSelector(): Promise<SelectorDetectionResult> {
  try {
    const html = capturePageHTML();
    const url = window.location.href;

    logger.log("Sending HTML to backend for selector detection...");

    const response = await fetch(`${CONFIG.API.BASE_URL}/selector/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html, url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Server error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.status === "success") {
      logger.log("Selector detected:", data.data);
      return {
        success: true,
        selector: data.data.selector,
        applyButtonSelector: data.data.applyButtonSelector,
        message: data.data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to detect selector",
      };
    }
  } catch (error) {
    logger.error("Error detecting selector:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

/**
 * Applies a coupon code to the detected input field
 */
export async function applyCoupon(
  code: string,
  selector: string,
  applyButtonSelector?: string
): Promise<boolean> {
  try {
    logger.log(
      `Attempting to apply coupon: ${code} with selector: ${selector}`
    );

    // First, check if this coupon code is already listed on the page
    // If it's in the available coupons list, we know it's valid - skip the application
    const couponElements = Array.from(document.querySelectorAll("*")).filter(
      (el) => {
        const text = el.textContent?.trim().toUpperCase() || "";
        return text === code && el.tagName !== "INPUT"; // Exact match, exclude the input field
      }
    );

    if (couponElements.length > 0) {
      // Coupon is listed on the page, it's valid - no need to apply or check
      logger.log(
        `✅ Coupon ${code} is listed on page - skipping application, marking as VALID`
      );
      return true;
    }

    // Wait for the element to be available with retries
    let inputElement: HTMLInputElement | null = null;
    let attempts = 0;
    const maxAttempts = 5;
    const waitTime = 500; // 500ms between attempts

    while (attempts < maxAttempts) {
      inputElement = document.querySelector(selector) as HTMLInputElement;
      if (inputElement) {
        logger.log(`Element found on attempt ${attempts + 1}`);
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        logger.log(
          `Element not found, waiting ${waitTime}ms before retry ${attempts}/${maxAttempts}`
        );
        // Log available elements for debugging
        const allInputs = document.querySelectorAll("input");
        logger.log(`Available inputs: ${allInputs.length}`);
        allInputs.forEach((input, index) => {
          if (input.id || input.className || input.placeholder) {
            logger.log(
              `Input ${index}: id="${input.id}", class="${input.className}", placeholder="${input.placeholder}"`
            );
          }
        });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    if (!inputElement) {
      logger.warn(
        `Input element not found with selector: ${selector} after ${maxAttempts} attempts`
      );
      return false;
    }

    // Clear existing value and ensure it's recognized
    inputElement.value = "";
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait a bit to ensure the clear is processed
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Set the coupon code character by character to simulate typing
    for (const char of code) {
      inputElement.value += char;
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Trigger final events
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    inputElement.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

    // Focus the input to ensure it's active
    inputElement.focus();

    // If there's an apply button, click it
    if (applyButtonSelector) {
      // Wait a bit for the input to be registered
      await new Promise((resolve) => setTimeout(resolve, 300));

      const applyButton = document.querySelector(
        applyButtonSelector
      ) as HTMLElement;
      if (applyButton) {
        logger.log("Clicking apply button");
        applyButton.click();

        // Wait for the server to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check if the input field still exists (modal might have closed if coupon was valid)
        const inputStillExists = document.querySelector(selector);

        if (!inputStillExists) {
          // Modal closed = coupon was successfully applied
          logger.log(
            "✅ Input field disappeared - modal closed, coupon is VALID"
          );
          return true;
        }

        // Input still exists, check for error messages
        // Re-find the input element and container since DOM might have changed
        const newInputElement = document.querySelector(
          selector
        ) as HTMLInputElement;
        if (!newInputElement) {
          logger.log("Input disappeared during check");
          return true;
        }

        let newContainer: HTMLElement | null = newInputElement;
        const newForm = newInputElement.closest("form");

        if (newForm) {
          newContainer = newForm;
        } else {
          let levels = 0;
          const maxLevels = 5;

          while (
            newContainer &&
            newContainer.parentElement &&
            levels < maxLevels
          ) {
            newContainer = newContainer.parentElement;
            levels++;
          }
        }

        const htmlAfter = newContainer
          ? newContainer.outerHTML
          : document.body.innerHTML;

        logger.log(
          `Input still exists, checking for validation messages (${htmlAfter.length} chars)`
        );

        // Send the HTML to backend for AI analysis
        try {
          const response = await fetch(
            `${CONFIG.API.BASE_URL}/coupon-validator/validate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                couponCode: code,
                html: htmlAfter.substring(0, 10000),
              }),
            }
          );

          if (!response.ok) {
            logger.warn(`Failed to validate coupon with AI, assuming failed`);
            return false;
          }

          const data = await response.json();

          if (data.status === "success" && data.data.isValid) {
            logger.log(`✅ AI confirmed: Coupon ${code} is VALID`);
            return true;
          } else {
            logger.log(`❌ AI confirmed: Coupon ${code} is INVALID`);
            return false;
          }
        } catch (error) {
          logger.error(`Error validating coupon with AI:`, error);
          // Fallback: assume failed if AI validation fails
          return false;
        }
      } else {
        logger.warn(
          `Apply button not found with selector: ${applyButtonSelector}`
        );
        // Try to submit the form if button not found
        const form = inputElement.closest("form");
        if (form) {
          logger.log("Submitting form instead");
          form.requestSubmit();
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } else {
      // Try to find and click a nearby button or submit the form
      const form = inputElement.closest("form");
      if (form) {
        // Look for common apply button patterns
        const possibleButtons = form.querySelectorAll(
          'button[type="submit"], button:not([type="button"]), input[type="submit"]'
        );
        if (possibleButtons.length > 0) {
          logger.log("Found potential apply button, clicking it");
          (possibleButtons[0] as HTMLButtonElement).click();
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          logger.log("Submitting form");
          form.requestSubmit();
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    logger.log(`Completed coupon application attempt: ${code}`);
    return false;
  } catch (error) {
    logger.error(`Error applying coupon ${code}:`, error);
    return false;
  }
}
