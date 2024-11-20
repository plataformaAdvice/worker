import { PrismaClient } from "@prisma/client";
import type { Job } from "bullmq";
import logger from "../../config/logger";
import nodemailer from "../../gateway/nodemailer";
import { getAllStudentsFromACourseByNoticeAndNotificationMode } from "@prisma/client/sql";

const prisma = new PrismaClient();

const updateNoticeStatus = async (
  id: string,
  status: "processing" | "sent"
) => {
  return await prisma.notice.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

export default {
  name: "processNoticeQueue",
  async job(job: Job) {
    logger.info(
      `PROCESS NOTICE JOB INITIATE. Notice ID ${job.data.id}, Notice Name ${job.data.name}`
    );

    // Change Notice Status to "processing"
    await updateNoticeStatus(job.data.id, "processing").catch((err) => {
      logger.error(
        err,
        "PROCESS NOTICE JOB AT UPDATE NOTICE STATUS TO PENDING"
      );
      throw new Error(err);
    });

    // Retrieving studends list from db
    const studentsNotificationPanelAndEmail = await prisma.$queryRawTyped(
      getAllStudentsFromACourseByNoticeAndNotificationMode(
        job.data.id,
        "notificationPanelAndEmail"
      )
    );

    // Check if the notice has to send email
    if (job.data.email) {
      const emailReceivers = studentsNotificationPanelAndEmail.map(
        (student) => student.person_email
      );

      await nodemailer
        .sendMail({
          from: '"Advice Educação" <ead@adviceeducacao.com.br>',
          to: emailReceivers.join(";"),
          subject: job.data.subject,
          text: job.data.description,
        })
        .catch((err) => {
          logger.error(err, "PROCESS NOTICE JOB AT SEND EMAIL");
          throw new Error(err);
        });
    }

    //Check if the notice has to sendo into notification panel
    if (job.data.notificationPanel) {
      // Retrieving studends list from db
      const studentsNotificationPanelOnly = await prisma.$queryRawTyped(
        getAllStudentsFromACourseByNoticeAndNotificationMode(
          job.data.id,
          "notificationPanelOnly"
        )
      );

      // concating both list into one
      const studentsNotificationPanel = [
        ...studentsNotificationPanelAndEmail,
        ...studentsNotificationPanelOnly,
      ];

      const updatedAt = new Date();
      const notificationReceivers = studentsNotificationPanel.map(
        (student) => ({
          noticeId: student.notice_id,
          personId: student.person_id,
          read: false,
          updatedAt,
        })
      );

      await prisma.notification_person
        .createMany({
          data: notificationReceivers,
        })
        .catch((err) => {
          logger.error(err, "PROCESS NOTICE JOB AT CREATE NOTIFICATION PERSON");
          throw new Error(err);
        });
    }

    // Change Notice Status to "processing"
    await updateNoticeStatus(job.data.id, "sent").catch((err) => {
      logger.error(
        err,
        "PROCESS NOTICE JOB AT UPDATE NOTICE STATUS TO PENDING"
      );
      throw new Error(err);
    });

    prisma.$disconnect();
  },
};
