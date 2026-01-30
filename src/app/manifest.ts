import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DAPFinance",
    short_name: "DAPFinance",
    description: "Premium Personal Finance",
    theme_color: "#0A0E1A",
    background_color: "#0A0E1A",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
