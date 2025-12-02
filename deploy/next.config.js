/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para generar .next/standalone
  output: "standalone",

  images: {
    domains: ["localhost", "medisuite-pro.com"],
  },

  webpack: (config) => {
    // Evita errores por dependencias que intentan usar "canvas"
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
