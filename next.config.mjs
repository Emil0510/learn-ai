/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Externalize packages that don't work well with webpack bundling
    // pdfjs-dist not externalized so worker is bundled and resolvable on Vercel
    serverComponentsExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent bundling native canvas packages (used by pdf libraries)
      config.externals = [
        ...(config.externals || []),
        "canvas",
        "@napi-rs/canvas",
      ];
    }
    return config;
  },
};

export default nextConfig;

