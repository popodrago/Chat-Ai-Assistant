/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for GitHub Pages
  // Set basePath and assetPrefix to your repository name
  basePath: '/Chat-Ai-Assistant', 
  assetPrefix: '/Chat-Ai-Assistant/', 
  trailingSlash: true, // Recommended for GitHub Pages to handle routes correctly
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
