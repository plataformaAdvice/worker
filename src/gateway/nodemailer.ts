import nodemailer from "nodemailer";
import nodemailerConfig from "../config/nodemailer";

export default nodemailer.createTransport(nodemailerConfig);
