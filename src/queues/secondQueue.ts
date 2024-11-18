import { Job } from "bullmq";
import logger from "../logger";

export default {
  name: "mySecondQueue",
  async job(job: Job) {
    logger.info("second Job");
    logger.info(job.data);
  },
};
