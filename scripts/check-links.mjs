import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
export async function htmlFiles(dir = "dist") {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? htmlFiles(path.join(dir, e.name))
          : e.name.endsWith(".html")
            ? [path.join(dir, e.name)]
            : [],
      ),
    )
  ).flat();
}
const errors = [];
let count = 0;
for (const file of await htmlFiles()) {
  const $ = load(await readFile(file, "utf8"));
  const route = "/" + path.relative("dist", file).replace(/index\.html$/, "");
  for (const el of $("a[href],img[src],script[src],link[href]").toArray()) {
    const href = $(el).attr("href") ?? $(el).attr("src");
    const url = new URL(href, `https://epochgrid.org${route}`);
    if (url.origin !== "https://epochgrid.org") continue;
    count++;
    let target = path.join("dist", decodeURIComponent(url.pathname));
    try {
      if ((await stat(target)).isDirectory())
        target = path.join(target, "index.html");
      const data = await readFile(target, "utf8");
      if (url.hash && target.endsWith(".html")) {
        const doc = load(data),
          id = decodeURIComponent(url.hash.slice(1));
        if (
          !doc("[id]")
            .toArray()
            .some((e) => doc(e).attr("id") === id)
        )
          errors.push(`${file}: missing fragment ${href}`);
      }
    } catch {
      errors.push(`${file}: missing ${href}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated ${count} internal links and assets.`);
