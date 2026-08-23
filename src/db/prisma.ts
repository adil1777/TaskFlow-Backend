import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import serverConfig from "../config/serverConfig";

const adapter = new PrismaPg({
  connectionString: serverConfig.databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;