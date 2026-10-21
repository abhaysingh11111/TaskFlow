import { google } from "googleapis";
import { randomBytes } from "node:crypto";

let gmailClient;

function getGmailClient() {
  const {
    USER_EMAIL,
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
  } = process.env;

  const missing = [
    ["USER_EMAIL", USER_EMAIL],
    ["GMAIL_CLIENT_ID", GMAIL_CLIENT_ID],
    ["GMAIL_CLIENT_SECRET", GMAIL_CLIENT_SECRET],
    ["GMAIL_REFRESH_TOKEN", GMAIL_REFRESH_TOKEN],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(
      `Missing email environment variables: ${missing.join(", ")}`
    );
  }

  if (!gmailClient) {
    const auth = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET
    );

    auth.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN,
    });

    gmailClient = google.gmail({
      version: "v1",
      auth,
    });
  }

  return { gmail: gmailClient, sender: USER_EMAIL };
}

function safeHeader(value, name) {
  const result = String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim();

  if (!result) {
    throw new Error(`${name} is required`);
  }

  return result;
}

function wrapBase64(value) {
  const encoded = Buffer.from(String(value), "utf8").toString("base64");
  return encoded.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlToText(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

const transporter = {
  async sendMail(message) {
    const { gmail, sender } = getGmailClient();

    const to = safeHeader(
      Array.isArray(message.to) ? message.to.join(", ") : message.to,
      "Recipient"
    );

    const subject = safeHeader(message.subject, "Subject");
    const html = String(message.html ?? "");
    const text = String(message.text ?? "");

    if (!html && !text) {
      throw new Error("Email body is required");
    }

    const textBody = text || htmlToText(html);
    const htmlBody = html || `<pre>${escapeHtml(textBody)}</pre>`;
    const boundary = `taskflow_${randomBytes(12).toString("hex")}`;

    const mimeMessage = [
      `From: ${safeHeader(sender, "Sender")}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64(textBody),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64(htmlBody),
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const raw = Buffer.from(mimeMessage, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {
      const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      return {
        messageId: result.data.id,
        accepted: [to],
      };
    } catch (error) {
      console.error(
        "Gmail API send failed:",
        error?.response?.data?.error?.message || error.message
      );

      throw error;
    }
  },
};

export default transporter;
