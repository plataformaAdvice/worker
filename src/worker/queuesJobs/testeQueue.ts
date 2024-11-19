import type { Job } from "bullmq";
import logger from "../../config/logger";

export default {
  name: "testQueue",
  async job(job: Job) {
    logger.info("testQueue");
    logger.info(job.data);
  },
};
