/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for GitHub Pages
  // If you are deploying to https://<username>.github.io/<repository-name>/
  // you MUST set basePath to '/<repository-name>'
  // basePath: '/your-repo-name', 
  trailingSlash: true, // Recommended for GitHub Pages to handle routes correctly
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
