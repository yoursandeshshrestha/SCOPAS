import { BACKGROUND_CONFIG } from "./config";

// ========= Simple logging utility for background script ========= //
class Logger {
  private prefix: string;
  private enabled: boolean;

  constructor(prefix: string, enabled: boolean) {
    this.prefix = prefix;
    this.enabled = enabled;
  }

  log(...args: unknown[]): void {
    if (this.enabled) {
      console.log(this.prefix, ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.enabled) {
      console.error(this.prefix, ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.enabled) {
      console.warn(this.prefix, ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.enabled) {
      console.info(this.prefix, ...args);
    }
  }
}

// ========= Export singleton instance ========= //
export const logger = new Logger(
  BACKGROUND_CONFIG.LOGGING.PREFIX,
  BACKGROUND_CONFIG.LOGGING.ENABLED
);
