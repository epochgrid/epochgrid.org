import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

// Preserve the website mark exactly, with extra room for circular avatar crops.
const favicon = await readFile("public/favicon.svg", "utf8");
const svg = favicon
  .replace(
    'viewBox="0 0 40 40"',
    'width="1024" height="1024" viewBox="-4 -4 48 48" role="img" aria-labelledby="title description"',
  )
  .replace(
    '<rect width="40" height="40"',
    '<title id="title">EpochGrid</title><desc id="description">Cyan geometric grid mark on a dark blue background.</desc><rect x="-4" y="-4" width="48" height="48"',
  );
await writeFile("public/epochgrid-avatar.svg", svg);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    "<style>body{margin:0}svg{display:block}</style>" + svg,
  );
  await page.screenshot({ path: "public/epochgrid-avatar.png" });
} finally {
  await browser.close();
}
