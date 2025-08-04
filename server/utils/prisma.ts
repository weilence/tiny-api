import { PrismaClient } from '~~/.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import '@prisma/client/runtime/query_compiler_bg.postgresql.wasm';

const prismaClientSingleton = () => {
  const runtimeConfig = useRuntimeConfig();

  const adapter = new PrismaPg({ connectionString: runtimeConfig.databaseUrl });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
