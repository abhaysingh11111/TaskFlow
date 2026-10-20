import { Resend } from "resend";

const transporter = {
  async sendMail(message) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is missing");
    }

    if (!from) {
      throw new Error("RESEND_FROM_EMAIL is missing");
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      console.error("Resend email error:", error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log("OTP email accepted by provider:", data?.id);

    return data;
  },
};

export default transporter;