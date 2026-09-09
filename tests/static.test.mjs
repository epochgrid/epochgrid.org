import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { load } from "cheerio";
const routes = [
  "",
  "project/",
  "architecture/",
  "technology/",
  "inspirations/",
  "developers/",
  "404.html",
];
for (const route of routes)
  test(`static route and metadata: /${route}`, async () => {
    const file = route.endsWith(".html") ? route : route + "index.html";
    const $ = load(await readFile(`dist/${file}`, "utf8"));
    assert.equal($("h1").length, 1);
    assert.equal($("main").length, 1);
    assert.ok($("title").text().includes("EpochGrid"));
    assert.ok($("meta[name=description]").attr("content").length > 40);
    assert.equal(
      $("link[rel=canonical]").attr("href"),
      `https://epochgrid.org/${route}`,
    );
    assert.equal(
      $('meta[property="og:url"]').attr("content"),
      `https://epochgrid.org/${route}`,
    );
    assert.equal(
      $('meta[property="og:image"]').attr("content"),
      "https://epochgrid.org/social.png",
    );
    assert.equal(
      JSON.parse($('script[type="application/ld+json"]').text()).codeRepository,
      "https://github.com/epochgrid/epochgrid",
    );
    assert.equal(
      $("#primary-navigation a[aria-current=page]").length,
      route && route !== "404.html" ? 1 : 0,
    );
    assert.ok($('a[href="#main"]').length);
  });
test("custom domain, discovery, and static-only output", async () => {
  assert.equal((await readFile("dist/CNAME", "utf8")).trim(), "epochgrid.org");
  assert.ok(
    (await readFile("dist/robots.txt", "utf8")).includes(
      "https://epochgrid.org/sitemap-index.xml",
    ),
  );
  assert.ok(
    (await readFile("dist/sitemap-0.xml", "utf8")).includes(
      "https://epochgrid.org/architecture/",
    ),
  );
  const manifest = JSON.parse(await readFile("dist/site.webmanifest", "utf8"));
  assert.equal(manifest.start_url, "/");
  const png = await readFile("dist/social.png");
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  const entries = await readdir("dist");
  assert.ok(!entries.includes("server"));
});
test("distinct titles and descriptions", async () => {
  const titles = [],
    descriptions = [];
  for (const route of routes) {
    const $ = load(
      await readFile(
        `dist/${route.endsWith(".html") ? route : route + "index.html"}`,
        "utf8",
      ),
    );
    titles.push($("title").text());
    descriptions.push($("meta[name=description]").attr("content"));
  }
  assert.equal(new Set(titles).size, routes.length);
  assert.equal(new Set(descriptions).size, routes.length);
});
