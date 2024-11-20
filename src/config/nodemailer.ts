export default {
  host: process.env.SMTP_ADDRESS_NODEMAILER,
  port: Number(process.env.SMTP_PORT_NODEMAILER),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME_NODEMAILER,
    pass: process.env.SMTP_PASSWORD_NODEMAILER,
  },
};
