import dotenv from "dotenv";

dotenv.config();

const serverConfig  = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  databaseUrl: process.env.DATABASE_URL!,

  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: Number(process.env.REDIS_PORT) || 6379,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,

  accessTokenExpiresIn:
    process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",

  refreshTokenExpiresIn:
    process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
};

export default serverConfig;