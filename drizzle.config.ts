import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './server/db',
  schema: './server/db/schema.ts',
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL as string,
  },
});
