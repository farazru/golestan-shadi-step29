import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/preregister",
  "/language",
  "/imath",
  "/extra",
  "/gallery",
  "/news",
  "/calendar",
  "/timetable",
  "/parents-assoc",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
