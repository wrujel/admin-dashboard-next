/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.pexels.com", "image.lexica.art"],
  },
  env: {
    USERS_PER_PAGE: "10",
  },
};

export default nextConfig;
