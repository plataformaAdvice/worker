import { PrismaClient } from "@prisma/client";
import type { Job } from "bullmq";
import logger from "../../config/logger";
import { getAllStudentsFromACourse } from "@prisma/client/sql";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const prisma = new PrismaClient();

export default {
  name: "processNoticeQueue",
  async job(job: Job) {
    // console.log(job.data);

    const allStudents = await prisma.$queryRawTyped(
      getAllStudentsFromACourse(job.data.id)
    );

    console.log(allStudents);

    prisma.$disconnect();
  },
};
