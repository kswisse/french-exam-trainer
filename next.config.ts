import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pdf-parse", "tesseract.js"],
};
export default nextConfig;
