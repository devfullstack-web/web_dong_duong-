import nodemailer from "nodemailer";
import { getThankYouTemplate } from "./mail/templates/thank-you";
import { getAdminNotificationTemplate } from "./mail/templates/admin-notification";
import { getApplicationConfirmationTemplate } from "./mail/templates/application-confirmation";
import { COMPANY_INFO } from "@/constants/site-info";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: process.env.MAIL_PORT === "465",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

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
    from: `"Sài Gòn Valve" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
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
    to: process.env.MAIL_FROM || process.env.MAIL_USER || COMPANY_INFO.email,
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
