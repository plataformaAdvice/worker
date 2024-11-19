import "dotenv/config";
import { Worker } from "bullmq";
import redisConfig from "../config/redis";
import * as queues from "./queuesJobs";
import logger from "../config/logger";

const workers = Object.values(queues).map((queue) => ({
  instance: new Worker(queue.name, queue.job, {
    connection: {
      ...redisConfig,
      retryStrategy: function (times: number) {
        return Math.max(Math.min(Math.exp(times), 20000), 1000);
      },
    },
    autorun: false, // Should not execute when instatiante
  }),
}));

workers.forEach((worker) => {
  worker.instance.run(); // Execute workers

  worker.instance.on("failed", (job, filedReason) => {
    if (job) {
      logger.error(
        `JOB FAILED: ${job.id} - ${job.name}. Reason: ${filedReason}`
      );
    }
  });
  worker.instance.on("progress", (job, process) => {
    logger.info(`JOB PROGRESS: ${job.id} - ${job.name}. Progress: ${process}%`);
  });
  worker.instance.on("completed", (job, returnvalue) => {
    logger.info(`JOB COMPLETED: ${job.id} - ${job.name} has completed!`);
  });
  worker.instance.on("error", (err) => {
    logger.error(`WORKER ERROR: ${err}`);
  });
  worker.instance.on("ioredis:close", () => {
    logger.fatal(`WORKER REDIS CLOSE`);
  });
});
