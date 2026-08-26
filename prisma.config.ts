import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

console.log('DATABASE HOST:', new URL(process.env.DATABASE_URL!).hostname);
console.log('DATABASE USER:', new URL(process.env.DATABASE_URL!).username);
console.log('DATABASE NAME:', new URL(process.env.DATABASE_URL!).pathname);

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },

  datasource: {
    url: env('DATABASE_URL'),
  },
});
