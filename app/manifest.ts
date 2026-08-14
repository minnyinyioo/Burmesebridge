import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BurmeseBridge",
    short_name: "BurmeseBridge",
    description: "A learning, information, jobs and community platform connecting Myanmar with the wider world.",
    start_url: "/my",
    display: "standalone",
    background_color: "#F7F4EC",
    theme_color: "#0B6B57",
    icons: [
      { src: "/brand-icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/brand-icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
      { src: "/brand-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
