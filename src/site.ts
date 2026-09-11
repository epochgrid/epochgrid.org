export const site = {
  name: "EpochGrid",
  url: "https://epochgrid.org",
  description:
    "An experimental messaging system combining NATS infrastructure with MLS end-to-end group encryption.",
  status: "Unaudited development prototype",
  revision: "fac33578ef393954f24295fd891f0190fc3a8cd7",
  reviewed: "2026-09-10",
  milestone: 16,
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
