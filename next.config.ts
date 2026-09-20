import type { NextConfig } from "next";

/**
 * Old Wix URLs → new routes. See docs/05-domain-cutover.md.
 *
 * statusCode: 301 rather than `statusCode: 301`, which emits a 308. Modern
 * crawlers treat the two alike, but the cutover doc asks for 301s and older
 * tools and link checkers understand them more reliably.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xfvlpnlusypzqzoeyyoc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/event-information", destination: "/", statusCode: 301 },
      { source: "/event-history", destination: "/our-story", statusCode: 301 },
      { source: "/pro-carvers", destination: "/carvers#pro", statusCode: 301 },
      { source: "/semi-pro-carvers", destination: "/carvers#semi", statusCode: 301 },
      { source: "/vendors", destination: "/visit", statusCode: 301 },
      { source: "/contact-us", destination: "/visit#contact", statusCode: 301 },
      { source: "/sponsor", destination: "/sponsorship", statusCode: 301 },
      // /2018-winners, /2019-winners, /2024-winners and any other /*-winners
      { source: "/:year(\\d{4})-winners", destination: "/our-story#winners", statusCode: 301 },
    ];
  },
};

export default nextConfig;
