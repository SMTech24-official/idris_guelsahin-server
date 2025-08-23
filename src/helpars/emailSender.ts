import nodemailer from "nodemailer";
import config from "../config";
import ApiError from "../errors/ApiErrors";

const emailSender = async (subject: string, email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  const emailTransport = transporter;

  const mailOptions = {
    from: `"Nexbix" <${config.emailSender.email}>`,
    to: email,
    subject,
    html,
  };

  // Send the email
  try {
    const info = await emailTransport.sendMail(mailOptions);
    // console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Error sending email");
  }
};

export default emailSender;


//email sender for contact us
export const emailSenderForContact = async (
  email: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  const emailTransport = transporter;

  const mailOptions = {
    from: `"Shift Work" <${email}>`,
    to: config.emailSender.email,
    subject: "New Contact Message from Nexbiz Market Website",
    html,
  };

  // Send the email
  try {
    const info = await emailTransport.sendMail(mailOptions);
    // console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Error sending email");
  }
};
