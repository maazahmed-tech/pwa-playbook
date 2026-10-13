/** @type {import('next').NextConfig} */
// The presentation demo entry (typed demo credentials, /demo) is compiled in where
// NEXT_PUBLIC_DEMO_LOGIN=1 (staging) and in CI test builds, which drive it end to end.
// The hosting provider also sets CI, so hosted builds only get it through the explicit
// variable — never on production. (Admin app: drop the demoLogin lines.)
const demoLogin = process.env.NEXT_PUBLIC_DEMO_LOGIN ?? (process.env.CI && !process.env.VERCEL ? "1" : undefined);

// On every response: never framed, referrer trimmed across sites, camera only for ourselves.
// A Content-Security-Policy is deliberately not here: add it after an audit of inline styles
// and third-party scripts (the 3D viewer and camera are the usual casualties).
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

const nextConfig = {
  transpilePackages: ["@app/db"],
  eslint: { ignoreDuringBuilds: true },
  ...(demoLogin ? { env: { NEXT_PUBLIC_DEMO_LOGIN: demoLogin } } : {}),
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
