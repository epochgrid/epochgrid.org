export const site = {
  name: "EpochGrid",
  url: "https://epochgrid.org",
  description:
    "An experimental messaging system combining NATS infrastructure with MLS end-to-end group encryption.",
  status: "Unaudited development prototype",
  revision: "0012ec15ba02c8e82e769a37b8f5f4014aa0e559",
  reviewed: "2026-09-08",
};
const core = "https://github.com/epochgrid/epochgrid";
export const urls = {
  organization: "https://github.com/epochgrid",
  source: core,
  website: "https://github.com/epochgrid/epochgrid.org",
  issues: `${core}/issues`,
  releases: `${core}/releases`,
  contributing: `${core}/blob/main/CONTRIBUTING.md`,
  license: `${core}/blob/main/LICENSE`,
  readme: `${core}/blob/main/README.md`,
};
export const sourceUrl = (path: string) =>
  `${core}/blob/${site.revision}/${path}`;
export const navigation = [
  { href: "/project/", label: "Project" },
  { href: "/architecture/", label: "Architecture" },
  { href: "/technology/", label: "Technology" },
  { href: "/inspirations/", label: "Inspirations" },
  { href: "/developers/", label: "Developers" },
];
export const statuses = {
  implemented: "Implemented",
  experimental: "Experimental",
  planned: "Planned",
};
