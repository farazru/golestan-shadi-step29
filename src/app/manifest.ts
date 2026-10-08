import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "گلستان شادی",
    short_name: "گلستان شادی",
    description: "پیش‌دبستان مختلط، دبستان دخترانه و زبانکده انگلیسی در شهر جدید سهند",
    start_url: "/",
    display: "standalone",
    lang: "fa",
    dir: "rtl",
    background_color: "#fffdf6",
    theme_color: "#33f5cc",
    icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" }],
    categories: ["education"],
  };
}
