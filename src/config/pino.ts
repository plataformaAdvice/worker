import "dotenv/config";
import type { TransportMultiOptions } from "pino";

const pinoConfig: TransportMultiOptions = {
  targets: [
    {
      target: "pino-pretty",
      level: process.env.NODE_ENV == "production" ? "info" : "debug",
      options: { translateTime: "UTC:yyyy-mm-dd HH:MM:ss" },
    },
    {
      target: "pino-mongodb",
      level: "info",
      options: {
        uri: process.env.MONGODB_URL,
        database: process.env.MONGODB_DATABASE,
        collection: "backend-log",
        mongoOptions: {
          auth: {
            username: process.env.MONGODB_USERNAME,
            password: process.env.MONGODB_PASSWORD,
          },
        },
      },
    },
  ],
};

export default pinoConfig;
