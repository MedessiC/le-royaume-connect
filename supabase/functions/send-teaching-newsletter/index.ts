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
    return json({ error: "Server configuration missing" }, 500);
  }

  if (!zohoPass) {
    return json({ error: "ZOHO_SMTP_PASSWORD environment variable is not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.json();
    const teachingId = payload.teaching_id;

    if (!teachingId) {
      return json({ error: "teaching_id is required" }, 400);
    }

    // 1. Fetch teaching details
    const { data: teaching, error: teachingError } = await supabase
      .from("teachings")
      .select("id, title, excerpt, content, cover_image_url, slug")
      .eq("id", teachingId)
      .single();

    if (teachingError || !teaching) {
      return json({ error: "Teaching not found" }, 404);
    }

    // 2. Fetch subscribers
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    const subscriberEmails = (subscribers || []).map((s) => s.email);

    // Also fetch registered user emails from profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    const profileEmails = (profiles || [])
      .map((p) => p.email)
      .filter((e): e is string => Boolean(e));

    // Combine & deduplicate emails
    const allEmails = Array.from(new Set([...subscriberEmails, ...profileEmails]));

    if (allEmails.length === 0) {
      return json({ message: "No subscribers found to send email to", count: 0 });
    }

    // 3. Create Zoho Mail Transporter
    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: zohoUser,
        pass: zohoPass,
      },
    });

    const teachingUrl = `https://share.leregnemillenaire.com/teachings/${teaching.slug || teaching.id}`;
    const excerptText = teaching.excerpt || teaching.content.replace(/<[^>]*>?/gm, "").substring(0, 180) + "...";

    // 4. Send emails in batches
    let successCount = 0;

    for (const recipient of allEmails) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.3); overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
            .header h1 { color: #d4af37; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
            .header p { color: #94a3b8; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 30px 25px; }
            .cover { width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); }
            .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; line-height: 1.4; }
            .excerpt { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 25px; }
            .btn { display: inline-block; background-color: #d4af37; color: #090d16; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 50px; text-decoration: none; text-align: center; }
            .footer { background-color: #090d16; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Le Règne Millénaire</h1>
              <p>Nouveau message & enseignement disponible</p>
            </div>
            <div class="content">
              ${teaching.cover_image_url ? `<img src="${teaching.cover_image_url}" class="cover" alt="${teaching.title}">` : ""}
              <div class="title">${teaching.title}</div>
              <div class="excerpt">${excerptText}</div>
              <div style="text-align: center; margin-top: 25px;">
                <a href="${teachingUrl}" class="btn">Lire l'enseignement complet</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Le Règne Millénaire — contact@leregnemillenaire.com</p>
              <p>Vous recevez cet email car vous êtes inscrit sur notre plateforme.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await transporter.sendMail({
          from: `"Le Règne Millénaire" <${zohoUser}>`,
          to: recipient,
          subject: `📜 Nouveau Enseignement: ${teaching.title}`,
          html: htmlContent,
        });
        successCount++;
      } catch (sendErr) {
        console.error(`Failed to send email to ${recipient}:`, sendErr);
      }
    }

    return json({
      success: true,
      message: `Newsletter sent to ${successCount} recipient(s)`,
      count: successCount,
    });
  } catch (err) {
    console.error("Newsletter Function Error:", err);
    return json({ error: "Failed to dispatch newsletter" }, 500);
  }
});
