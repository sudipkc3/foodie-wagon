import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A lockfile exists in a parent directory; pin the project root explicitly.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
