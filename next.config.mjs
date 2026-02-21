/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Externalize pdfjs-dist so webpack doesn't bundle it (avoids Object.defineProperty error)
    serverComponentsExternalPackages: ["pdf-parse", "@napi-rs/canvas", "pdfjs-dist"],
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

