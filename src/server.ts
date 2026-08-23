import app from "./app";
import serverConfig from "./config/serverConfig";
import  "./queueu/redis";
import  prisma  from "./db/prisma";

const PORT = serverConfig.port || 5000;


async function bootstrap() {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL connected");

    app.listen(PORT, () => {
      console.log(
        `🚀 TaskFlow API running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();