import nodemailer from "nodemailer";
import templateEmail from "./templateEmail";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendEmail = async (name: string, email: string, message: string) => {
  await transporter.sendMail({
    from: `"${name}" <${process.env.MAIL_USERNAME}>`,
    to: process.env.MAIL_USERNAME,
    replyTo: email,
    subject: `New message from ${name} (Portfolio)`,
    html: templateEmail(message),
  });
};

export default sendEmail;
