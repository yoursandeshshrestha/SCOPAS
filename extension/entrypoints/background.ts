import type { BackgroundMessage } from "./background/types";
import { badgeManager } from "./background/badge-manager";
import { sidepanelManager } from "./background/sidepanel-manager";
import { logger } from "./background/logger";

// ========= Handle messages from content scripts ========= //
function handleContentMessage(
  message: BackgroundMessage,
  sender: Parameters<
    Parameters<typeof browser.runtime.onMessage.addListener>[0]
  >[1]
): void {
  const tabId = sender.tab?.id;
  if (!tabId) {
    logger.warn("Message received from unknown tab");
    return;
  }

  switch (message.type) {
    case "COUPONS_FOUND":
      if (message.data) {
        badgeManager.showBadge(tabId, message.data);
      }
      break;

    case "CLEAR_BADGE":
      badgeManager.clearBadge(tabId);
      break;

    default:
      logger.warn("Unknown message type:", message);
  }
}

// ========= Handle extension icon click ========= //
function handleIconClick(
  tab: Parameters<Parameters<typeof browser.action.onClicked.addListener>[0]>[0]
): void {
  logger.log("Extension icon clicked", tab);

  const tabId = tab.id;
  const windowId = tab.windowId;

  // Always open sidepanel when extension icon is clicked
  if (windowId) {
    sidepanelManager.openSidepanel(windowId);
  }
}

// ========= Handle tab lifecycle events ========= //
function handleTabRemoved(tabId: number): void {
  badgeManager.removeTab(tabId);
}

function handleTabUpdated(
  tabId: number,
  changeInfo: Parameters<
    Parameters<typeof browser.tabs.onUpdated.addListener>[0]
  >[1]
): void {
  if (changeInfo.url) {
    badgeManager.clearBadge(tabId);
  }
}

// ========= Main background script entry point ========= //
export default defineBackground(() => {
  logger.log("Background script loaded", { id: browser.runtime.id });

  browser.runtime.onMessage.addListener(handleContentMessage);
  browser.action.onClicked.addListener(handleIconClick);
  browser.tabs.onRemoved.addListener(handleTabRemoved);
  browser.tabs.onUpdated.addListener(handleTabUpdated);
});
