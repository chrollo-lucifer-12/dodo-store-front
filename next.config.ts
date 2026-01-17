import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize Cloudflare dev mode for local development
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  images: {
    // Use Cloudflare's image optimization when deployed
    loader: process.env.NODE_ENV === "production" ? "custom" : undefined,
    loaderFile:
      process.env.NODE_ENV === "production"
        ? "./src/lib/cloudflare-image-loader.ts"
        : undefined,
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    // Suppress warnings about critical dependencies in OpenTelemetry instrumentation
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
  /* config options here */
};

let config = nextConfig;

if (process.env.NEXT_PUBLIC_SENTRY_PROJECT_NAME) {
  try {
    config = withSentryConfig(config, {
      org: "dodo-payments",
      project: process.env.NEXT_PUBLIC_SENTRY_PROJECT_NAME,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      reactComponentAnnotation: {
        enabled: true,
      },
      tunnelRoute: "/monitoring",
      disableLogger: true,
    });
  } catch (error) {
    console.warn("Sentry configuration failed:", error);
  }
}

export default config;
