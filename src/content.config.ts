import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const guide = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guide" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    sources: z.array(z.object({ label: z.string(), path: z.string() })).min(1),
  }),
});
export const collections = { guide };
