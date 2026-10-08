import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const description = "پیش‌دبستان مختلط، دبستان دخترانه و زبانکده انگلیسی گلستان شادی در شهر جدید سهند. نمایندگی آیمث.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "گلستان شادی | پیش‌دبستان، دبستان و زبانکده سهند",
    template: "%s | گلستان شادی",
  },
  description,
  applicationName: "گلستان شادی",
  authors: [{ name: "گلستان شادی" }],
  keywords: ["گلستان شادی", "دبستان دخترانه سهند", "پیش دبستان سهند", "زبانکده سهند", "آیمث سهند"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "گلستان شادی",
    title: "گلستان شادی | پیش‌دبستان، دبستان و زبانکده سهند",
    description,
    images: [{ url: "/kids-hero.jpg", alt: "گلستان شادی" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "گلستان شادی",
    description,
    images: ["/kids-hero.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#33f5cc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} h-full antialiased`}>
      <body className="school-shell flex min-h-full flex-col">{children}</body>
    </html>
  );
}
