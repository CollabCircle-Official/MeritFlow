import type {NextConfig} from 'next';

const config: NextConfig = {
  // Keep the development cache separate from production builds so running
  // `next dev` and `next build` cannot corrupt each other.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default config;
