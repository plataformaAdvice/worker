import "dotenv/config";
import Queue from "./config/queue";
import logger from "./config/logger";
import { PrismaClient } from "@prisma/client";

// JobBuilder, use this file to run tests in you building job and then copy and paste it to the job into worker/queuesJobs/QueueName.ts
// To run jobBuilder run: yarn run job-builder on the terminal

const prisma = new PrismaClient();

async function jobBuilder() {
  // await Queue.add("QueueName", `JobName`, { foo: "bar" }, {opts});
}

jobBuilder()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit();
  });
