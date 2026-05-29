import nodemailer from "nodemailer";
import { getThankYouTemplate } from "./mail/templates/thank-you";
import { getAdminNotificationTemplate } from "./mail/templates/admin-notification";
import { getApplicationConfirmationTemplate } from "./mail/templates/application-confirmation";
import { getRequiredEnv, getRequiredPositiveIntegerEnv } from "@/utils/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const port = getRequiredPositiveIntegerEnv(process.env.MAIL_PORT, "MAIL_PORT");

  transporter = nodemailer.createTransport({
    host: getRequiredEnv(process.env.MAIL_HOST, "MAIL_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: getRequiredEnv(process.env.MAIL_USER, "MAIL_USER"),
      pass: getRequiredEnv(process.env.MAIL_PASSWORD, "MAIL_PASSWORD"),
    },
  });

  return transporter;
}

function getMailFrom() {
  return `"Sài Gòn Valve" <${getRequiredEnv(process.env.MAIL_FROM, "MAIL_FROM")}>`;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const mailOptions = {
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendThankYouEmail(email: string, name: string) {
  const subject = "Cảm ơn bạn đã liên hệ với Sài Gòn Valve";
  const html = getThankYouTemplate(name, email);

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

export async function sendAdminNotificationEmail(contactData: {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}) {
  const subject = `[YÊU CẦU MỚI] Từ khách hàng: ${contactData.name}`;
  const html = getAdminNotificationTemplate(contactData);

  return sendEmail({
    to: getRequiredEnv(process.env.MAIL_FROM, "MAIL_FROM"),
    subject,
    html,
  });
}

export async function sendApplicationConfirmationEmail(email: string, name: string, jobTitle: string) {
  const subject = `[XÁC NHẬN] Đã tiếp nhận hồ sơ ứng tuyển: ${jobTitle}`;
  const html = getApplicationConfirmationTemplate(name, jobTitle);

  return sendEmail({
    to: email,
    subject,
    html,
  });
}
