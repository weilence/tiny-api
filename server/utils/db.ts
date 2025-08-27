import * as schema from '../db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

const runtimeConfig = useRuntimeConfig();
export const db = drizzle({ schema: schema, connection: runtimeConfig.databaseUrl });
