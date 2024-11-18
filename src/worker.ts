import "dotenv/config";
import { Worker } from "bullmq";
import redisConfig from "./config/redis";
import * as queues from "./queues";
import logger from "./logger";

const workerList = Object.values(queues).map((queue) => ({
  instance: new Worker(queue.name, queue.job, {
    connection: redisConfig,
    autorun: false, // Should not execute when instatiante
  }),
}));

workerList.forEach((worker) => {
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
    logger.fatal(`WORKER ERROR: ${err}`);
  });
});
