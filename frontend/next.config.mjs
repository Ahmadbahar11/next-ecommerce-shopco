/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    // Storefront pages read searchParams for filtering/sorting; without this
    // the client Router Cache can serve a stale RSC payload from the same
    // route visited moments earlier with different query params.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
