import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/preregister",
  "/language",
  "/language/timetable",
  "/parenting",
  "/imath",
  "/extra",
  "/gallery",
  "/news",
  "/calendar",
  "/timetable",
  "/facilities",
  "/staff",
  "/achievements",
  "/regulations",
  "/help",
  "/register",
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
