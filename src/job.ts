import "dotenv/config";
import Queue from "./config/queue";
import logger from "./config/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function job() {
  const now = new Date();

  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const tomorrow = new Date(
    Date.UTC(now.getFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  tomorrow.setDate(now.getDate());

  console.log("now", now);
  console.log("today", today);
  console.log("tomorrow", tomorrow);

  const notices = await prisma.notice.findMany({
    where: {
      status: "pending",
      active: true,
      publishedAt: {
        gte: today,
        lte: tomorrow,
      },
    },
  });

  // for await (const notice of notices) {
  //   if (notice && notice.publishedAt && notice.publishedAt <= now) {
  //     console.log(notice.publishedAt);
  //     console.log(now);
  //     console.log(true);
  //   }
  // }
  await Queue.add(
    "processNoticeQueue",
    `process-notice-ffa0ee01-7c75-4af1-8256-206f1f6ab8dc`,
    notices[0]
  );
}

job()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit();
  });
