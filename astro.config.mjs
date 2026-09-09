import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://epochgrid.org",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
});
