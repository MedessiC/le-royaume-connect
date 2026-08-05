export type NewsletterFormat = "html" | "text";

export type NewsletterDraft = {
  subject: string;
  content: string;
  format: NewsletterFormat;
};

export type NewsletterEmailPayload = {
  subject: string;
  html: string;
  text: string;
};

function stripHtml(value: string) {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildNewsletterEmailContent({
  subject,
  content,
  format,
}: NewsletterDraft): NewsletterEmailPayload {
  const safeSubject = subject.trim() || "Nouveau message";
  const safeContent = content.trim() || "Bonjour,\n\nNous avons un nouveau message à partager avec vous.";
  const plainText = format === "html" ? stripHtml(safeContent) : safeContent;

  const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeSubject}</title>
  </head>
  <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;color:#f8fafc;">
    <div style="max-width:640px;margin:32px auto;background:#111827;border:1px solid #d4af37;border-radius:20px;overflow:hidden;">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#111827,#1f2937);border-bottom:1px solid rgba(212,175,55,0.3);">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#d4af37;font-weight:700;">Le Règne Millénaire</div>
        <h1 style="margin:10px 0 0;font-size:24px;color:#ffffff;">${safeSubject}</h1>
      </div>
      <div style="padding:24px 28px;line-height:1.7;color:#e2e8f0;">
        ${format === "html" ? safeContent : `<div style="white-space:pre-wrap;">${safeContent}</div>`}
      </div>
      <div style="padding:18px 28px 24px;background:#0b1220;font-size:12px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.08);">
        Vous recevez cet email parce que vous êtes abonné à la communauté Le Règne Millénaire.
      </div>
    </div>
  </body>
</html>`;

  return {
    subject: safeSubject,
    html,
    text: plainText,
  };
}
