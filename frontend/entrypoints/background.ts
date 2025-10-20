export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // Open sidepanel when extension icon is clicked
  browser.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked", tab);
    browser.sidePanel
      .open({ windowId: tab.windowId })
      .then(() => {
        console.log("Sidepanel opened successfully");
      })
      .catch((error) => {
        console.error("Error opening sidepanel:", error);
      });
  });
});
