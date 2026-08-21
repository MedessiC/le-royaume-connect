import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";
import nodemailer from "npm:nodemailer@6.9.13";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const zohoUser = Deno.env.get("ZOHO_SMTP_USER") || "contact@leregnemillenaire.com";
  const zohoPass = Deno.env.get("ZOHO_SMTP_PASSWORD");

  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ success: false, error: "Configuration serveur Supabase manquante." }, 200);
  }

  if (!zohoPass) {
    return json({
      success: false,
      error: "Mot de passe Zoho Mail non configuré (ZOHO_SMTP_PASSWORD).",
      details: "Ajoutez la clé ZOHO_SMTP_PASSWORD dans le Dashboard Supabase (Settings > Edge Functions > Secrets).",
    }, 200);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.json();
    const subject = payload.subject || "Nouveau message";
    const preheader = payload.preheader || "";
    const content = payload.content || "";
    const format = payload.format || "html";

    if (!content.trim()) {
      return json({ error: "content is required" }, 400);
    }

    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    const subscriberEmails = (subscribers || [])
      .map((s: { email?: string | null }) => s.email)
      .filter((e): e is string => Boolean(e));

    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmails = (authUsers?.users || [])
      .map((u) => u.email)
      .filter((e): e is string => Boolean(e));

    const emails = Array.from(new Set([...subscriberEmails, ...userEmails]));

    if (emails.length === 0) {
      return json({ message: "No subscribers found to send email to", count: 0 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: zohoUser,
        pass: zohoPass,
      },
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <style>
      body { margin:0; padding:0; background:#0f172a; font-family:Arial, sans-serif; color:#f8fafc; }
      .wrapper { max-width:640px; margin:32px auto; background:#111827; border:1px solid #d4af37; border-radius:20px; overflow:hidden; }
      .header { padding:24px 28px; background:linear-gradient(135deg,#111827,#1f2937); border-bottom:1px solid rgba(212,175,55,0.2); }
      .eyebrow { font-size:12px; text-transform:uppercase; letter-spacing:2px; color:#d4af37; font-weight:700; }
      .title { margin:8px 0 0; font-size:24px; color:#ffffff; }
      .preheader { margin-top:6px; font-size:13px; color:#94a3b8; }
      .body { padding:24px 28px; line-height:1.7; color:#e2e8f0; }
      .footer { padding:18px 28px 24px; font-size:12px; color:#94a3b8; background:#0b1220; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <div class="eyebrow">Le Règne Millénaire</div>
        <h1 class="title">${subject}</h1>
        ${preheader ? `<div class="preheader">${preheader}</div>` : ""}
      </div>
      <div class="body">${format === "html" ? content : `<div style="white-space:pre-wrap;">${content}</div>`}</div>
      <div class="footer">Vous recevez cet email parce que vous êtes abonné à la communauté Le Règne Millénaire.</div>
    </div>
  </body>
</html>`;

    let successCount = 0;

    for (const recipient of emails) {
      try {
        await transporter.sendMail({
          from: `"Le Règne Millénaire" <${zohoUser}>`,
          to: recipient,
          subject,
          text: format === "text" ? content : undefined,
          html: htmlContent,
        });
        successCount++;
      } catch (sendErr) {
        console.error(`Failed to send email to ${recipient}:`, sendErr);
      }
    }

    return json({ success: true, message: `Broadcast sent to ${successCount} recipient(s)`, count: successCount });
  } catch (err) {
    console.error("Broadcast newsletter error:", err);
    return json({ error: "Failed to dispatch broadcast newsletter" }, 500);
  }
});
