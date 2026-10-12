// Static export so the site can be hosted on GitHub Pages (no server needed).
// When deployed to https://<user>.github.io/<repo>/ the workflow sets
// NEXT_PUBLIC_BASE_PATH=/<repo>. Leave it empty for a custom domain or <user>.github.io.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
}

export default nextConfig
