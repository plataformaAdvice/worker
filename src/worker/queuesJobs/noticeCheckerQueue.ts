import type { Job } from "bullmq";
import logger from "../../config/logger";
import Queue from "../../config/queue";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  name: "noticeCheckerQueue",
  async job(job: Job) {
    logger.info(`NOTICE CHECKER JOB INITIATE. ID ${job.id}`);

    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const tomorrow = new Date(
      Date.UTC(now.getFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    tomorrow.setDate(now.getDate());

    const notices = await prisma.notice
      .findMany({
        where: {
          status: "pending",
          active: true,
          publishedAt: {
            gte: today,
            lte: tomorrow,
          },
        },
      })
      .catch((err) => {
        logger.error(err, "NOTICE CHEKER REPEAT JOB AT FINDMANY NOTICES TODAY");
        throw new Error(err);
      });

    for await (const notice of notices) {
      if (notice && notice.publishedAt && notice.publishedAt <= now) {
        await Queue.add(
          "processNoticeQueue",
          `process-notice-${notice.subject}`,
          notice
        );
      }
    }

    prisma.$disconnect();
  },
};
