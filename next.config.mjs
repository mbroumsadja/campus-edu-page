/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pdf.js charge « canvas » seulement côté Node : inutile dans le navigateur
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
