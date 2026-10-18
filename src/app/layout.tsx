import type { Metadata, Viewport } from "next";
import "./fonts.css";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: "%s | J.O. Vision Care" },
  description: site.description,
  applicationName: site.name,
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141313",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preload" href="/fonts/IBMPlexSansThai-400-thai.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/IBMPlexSansThai-700-thai.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/BebasNeue-400-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
