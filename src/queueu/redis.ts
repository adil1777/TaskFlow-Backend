import IORedis from "ioredis";
import serverConfig from "../config/serverConfig";

export const redis = new IORedis({
  host: serverConfig.redisHost,
  port: serverConfig.redisPort,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("close", () => {
  console.log("⚠️ Redis connection closed");
});
