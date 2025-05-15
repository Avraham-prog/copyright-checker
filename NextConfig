/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["res.cloudinary.com"], // אם תשתמש בקומפוננטת <Image />
  },
  experimental: {
    serverActions: true,
  },
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_ACRCLOUD_SECRET_KEY,
    LEGAL_ANALYSIS_API_URL: process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL,
    LEGAL_ANALYSIS_API_KEY: process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_KEY
  }
};

module.exports = nextConfig;
