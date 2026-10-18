import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "J.O. Vision Care", short_name: "J.O. Vision", start_url: "/", display: "standalone", background_color: "#f7f6f4", theme_color: "#141313", icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }] };
}
