import { Queue } from "bullmq";
import type { JobsOptions } from "bullmq";
import redisConfig from "./redis";
import logger from "./logger";

const queuesList = ["noticeCheckerQueue", "processNoticeQueue", "testQueue"];

const queues = queuesList.map((queueName) => ({
  instance: new Queue(queueName, {
    connection: {
      ...redisConfig,
      retryStrategy: function (times: number) {
        return Math.max(Math.min(Math.exp(times), 20000), 1000);
      },
    },
  }),
  queueName: queueName,
}));

queues.forEach((queue) => {
  queue.instance.on("error", (err) => {
    logger.error(`QUEUE ERROR: ${err}`);
  });
  queue.instance.on("ioredis:close", () => {
    logger.fatal(`QUEUE IOREDIS CLOSE`);
  });
});

export default {
  queues,

  add(queueName: string, jobName: string, jobData: object, opts?: JobsOptions) {
    const joOptions = {
      ...opts,
      removeOnComplete: 1000,
      removeOnFail: 1000,
    };

    const queue = queues.find((queue) => queue.queueName === queueName);
    if (queue) {
      return queue.instance.add(jobName, jobData, joOptions);
    } else {
      logger.error(
        `QueueName ${queueName} provided does not found at add method`
      );
      throw new Error(
        `QueueName ${queueName} provided does not found at add method`
      );
    }
  },

  getJobs(queueName: string) {
    const queue = queues.find((queue) => queue.queueName === queueName);
    if (queue) {
      return queue.instance.getJobs();
    } else {
      logger.error(
        `QueueName ${queueName} provided does not found at add getJobs`
      );
      throw new Error(
        `QueueName ${queueName} provided does not found at add getJobs`
      );
    }
  },

  upsertJobScheduler(
    queueName: string,
    schedulerId: string,
    ...data: [object, object]
  ) {
    const queue = queues.find((queue) => queue.queueName === queueName);
    if (queue) {
      return queue.instance.upsertJobScheduler(schedulerId, ...data);
    } else {
      logger.error(
        `QueueName ${queueName} provided does not found at upsertJobScheduler method`
      );
      throw new Error(
        `QueueName ${queueName} provided does not found at upsertJobScheduler method`
      );
    }
  },

  removeJobScheduler(queueName: string, schedulerId: string) {
    const queue = queues.find((queue) => queue.queueName === queueName);
    if (queue) {
      return queue.instance.removeJobScheduler(schedulerId);
    } else {
      logger.error(
        `QueueName ${queueName} provided does not found at removeJobScheduler method`
      );
      throw new Error(
        `QueueName ${queueName} provided does not found at removeJobScheduler method`
      );
    }
  },

  async getJobSchedulers() {
    const schedulers = await Promise.all(
      queues.map(async (queue) => {
        return {
          queueName: queue.instance.name,
          queueJobSchedulersList: await queue.instance.getJobSchedulers(
            0,
            9,
            true
          ),
        };
      })
    );
    logger.info("getJobSchedulers was called");
    return schedulers;
  },
};
