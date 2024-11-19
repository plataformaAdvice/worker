import type { Job } from "bullmq";
import logger from "../../config/logger";
import Queue from "../../config/queue";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  name: "noticeCheckerQueue",
  async job(job: Job) {
    console.log("noticeCheckerQueue");
    console.log("jobId:", job.id);
    console.log("jobName:", job.name);
    job.updateProgress(0);
    await sleep(1000);
    job.updateProgress(50);
    await sleep(1000);
    job.updateProgress(100);
    await Queue.add("processNoticeQueue", "testing", {
      foo: "bard",
    });
  },
};
