import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Optional exact R2 hostname (e.g. pub-xxxx.r2.dev); when unset any *.r2.dev bucket is allowed.
const posterR2Host = process.env.NEXT_PUBLIC_POSTER_R2_HOST || "**.r2.dev";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: posterR2Host,
        pathname: "/events/*/presentations/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:locale(th|en)/sessions/confirm",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
