import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "SCOPAS",
    action: {
      default_title: "Open Sidepanel",
    },
  },
});
