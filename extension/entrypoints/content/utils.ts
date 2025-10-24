/**
 * Extract domain name from URL
 * @param url - The URL to extract domain from
 * @returns The domain name without www prefix
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    
    // Remove www prefix
    hostname = hostname.replace(/^www\./, "");
    
    return hostname;
  } catch (error) {
    console.error("Error extracting domain:", error);
    return "";
  }
}

/**
 * Extract store name from domain
 * For example: amazon.com -> amazon, ebay.co.uk -> ebay
 * @param domain - The domain to extract store name from
 * @returns The store name or "Unlisted Store" if extraction fails
 */
export function extractStoreName(domain: string): string {
  if (!domain || domain.trim() === "") {
    return "Unlisted Store";
  }

  // Remove common TLDs and get the main part
  const parts = domain.split(".");
  
  if (parts.length >= 2) {
    // Return the part before the TLD
    return parts[0];
  }
  
  return domain || "Unlisted Store";
}

/**
 * Check if the domain matches a store link
 * @param domain - Current page domain
 * @param storeLink - Store link from database
 * @returns Whether they match
 */
export function matchesDomain(domain: string, storeLink: string): boolean {
  try {
    const storeDomain = extractDomain(storeLink);
    return domain === storeDomain || domain.endsWith(`.${storeDomain}`);
  } catch (error) {
    return false;
  }
}

