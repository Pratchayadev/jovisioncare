import type { NextConfig } from "next";

const r2 = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: r2 ? [{ protocol: r2.protocol.replace(":", "") as "https", hostname: r2.hostname }] : [],
  },
  experimental: { serverActions: { bodySizeLimit: "4mb" /* Vercel รับได้สูงสุด 4.5MB — ฟอร์มย่อรูปในเบราว์เซอร์ก่อนส่ง */ } },
};

export default nextConfig;
