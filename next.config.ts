import type { NextConfig } from "next";

/**
 * Old Wix URLs → new routes. See docs/05-domain-cutover.md.
 * All permanent (301) so search engines and printed links follow.
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
      { source: "/event-information", destination: "/", permanent: true },
      { source: "/event-history", destination: "/our-story", permanent: true },
      { source: "/pro-carvers", destination: "/carvers#pro", permanent: true },
      { source: "/semi-pro-carvers", destination: "/carvers#semi", permanent: true },
      { source: "/vendors", destination: "/visit", permanent: true },
      { source: "/contact-us", destination: "/visit#contact", permanent: true },
      { source: "/sponsor", destination: "/sponsorship", permanent: true },
      // /2018-winners, /2019-winners, /2024-winners and any other /*-winners
      { source: "/:year(\\d{4})-winners", destination: "/our-story#winners", permanent: true },
    ];
  },
};

export default nextConfig;
