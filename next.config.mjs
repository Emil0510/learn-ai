/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Externalize packages that don't work well with webpack bundling
    serverComponentsExternalPackages: [
      "pdf-parse",
      "pdfjs-dist",
      "@napi-rs/canvas",
    ],
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

