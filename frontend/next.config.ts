import type { NextConfig } from 'next'
import * as dotenv from 'dotenv'

dotenv.config()

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SERVER: process.env.NEXT_PUBLIC_SERVER
  }
}

export default nextConfig
