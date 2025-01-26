/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["fa"],
    defaultLocale: "fa",
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trustseal.enamad.ir",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.c2.liara.space",
        port: "",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: ["xlsx"],
};

export default nextConfig;
