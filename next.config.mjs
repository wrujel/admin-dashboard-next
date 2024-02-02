/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "image.lexica.art",
      },
    ],
  },
  env: {
    USERS_PER_PAGE: "5",
    PRODUCTS_PER_PAGE: "5",
  },
};

export default nextConfig;
