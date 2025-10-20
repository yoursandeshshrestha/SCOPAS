import { logger } from "./logger";

// ========= Sidepanel Manager - Handles extension sidepanel ========= //
class SidepanelManager {
  async openSidepanel(windowId: number): Promise<void> {
    try {
      await browser.sidePanel.open({ windowId });
      logger.log("Sidepanel opened successfully");
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error opening sidepanel:", error.message);
      }
    }
  }
}

// ========= Export singleton instance ========= //
export const sidepanelManager = new SidepanelManager();
