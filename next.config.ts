import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import lingoCompiler from "lingo.dev/compiler";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize Cloudflare dev mode for local development
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  images: {
    // Use Cloudflare's image optimization when deployed
    loader: process.env.NODE_ENV === "production" ? "custom" : undefined,
    loaderFile: process.env.NODE_ENV === "production" ? "./src/lib/cloudflare-image-loader.ts" : undefined,
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    // Suppress warnings about critical dependencies in OpenTelemetry instrumentation
    // These are common in instrumentation libraries that use dynamic requires
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
  /* config options here */
};

// Initialize Lingo.dev Compiler for Next.js (App Router under src/app)
const withLingo = lingoCompiler.next({
  sourceRoot: "src/app",
  lingoDir: "lingo",
  sourceLocale: "en",
  targetLocales: [
    "ar",
    "ca",
    "de",
    "zh",
    "es",
    "fr",
    "he",
    "it",
    "ja",
    "nl",
    "pl",
    "pt",
    "sv",
    "tr",
  ],
  rsc: true,
  useDirective: false,
  debug: false,
  models: {
    "*:*": "openrouter:openai/gpt-4.1-mini",
  },
});

// Only apply Sentry configuration if environment variables are present
let config = withLingo(nextConfig);

if (process.env.NEXT_PUBLIC_SENTRY_PROJECT_NAME) {
  try {
    // Dynamic import for Sentry to avoid linter issues

    config = withSentryConfig(config, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: "dodo-payments",
      project: process.env.NEXT_PUBLIC_SENTRY_PROJECT_NAME,

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Automatically annotate React components to show their full name in breadcrumbs and session replay
      reactComponentAnnotation: {
        enabled: true,
      },

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    });
  } catch (error) {
    console.warn("Sentry configuration failed:", error);
  }
}

export default config;
