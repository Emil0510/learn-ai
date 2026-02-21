/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Externalize packages that don't work well with webpack bundling
    serverComponentsExternalPackages: ["pdf-parse", "pdf-to-img", "pdfjs-dist"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent bundling canvas (used by pdf libraries)
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },
};

export default nextConfig;

