import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { buildNewsletterEmailContent, type NewsletterFormat } from "@/lib/newsletter";
import { AlertCircle, CheckCircle2, Mail, SendHorizonal } from "lucide-react";

const NewsletterCampaigns = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("Nouveau message pour la communauté");
  const [preheader, setPreheader] = useState("Un message important à partager avec tous les abonnés.");
  const [content, setContent] = useState(`<h2>Bonjour à tous</h2><p>Voici un message inspirant à partager avec la communauté.</p><p><strong>Le Règne Millénaire</strong></p>`);
  const [format, setFormat] = useState<NewsletterFormat>("html");
  const [recipientCount, setRecipientCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipients = async () => {
      const [{ data: subscribers }, { data: profiles }] = await Promise.all([
        supabase.from("newsletter_subscribers").select("email").eq("is_active", true),
        supabase.from("profiles").select("id"),
      ]);

      const subEmails = (subscribers || []).map((s: { email?: string | null }) => s.email).filter(Boolean) as string[];
      const totalCount = subEmails.length + (profiles?.length || 0);
      setRecipientCount(totalCount);
    };

    loadRecipients();
  }, []);

  const preview = useMemo(() => buildNewsletterEmailContent({ subject, content, format }), [content, format, subject]);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({ title: "Champs requis", description: "Renseignez l’objet et le contenu du mail avant l’envoi." });
      return;
    }

    setSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-broadcast-newsletter", {
        body: {
          subject: subject.trim(),
          preheader: preheader.trim(),
          content: content.trim(),
          format,
        },
      });

      if (error) {
        throw error;
      }

      const count = data?.count ?? 0;
      setLastResult(`Campagne envoyée à ${count} destinataire${count > 1 ? "s" : ""}.`);
      toast({ title: "Campagne envoyée", description: data?.message || `Le message a été envoyé à ${count} destinataire${count > 1 ? "s" : ""}.` });
    } catch (err: any) {
      console.error("Broadcast newsletter error", err);
      setLastResult(err?.message || "Impossible d’envoyer la campagne.");
      toast({ title: "Échec de l’envoi", description: err?.message || "Vérifiez la configuration Zoho Mail et les variables d’environnement." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-gold/20 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-gold/8 via-background to-background">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Campagnes newsletter</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rédigez un message HTML, CSS ou texte simple et envoyez-le à tous les abonnés enregistrés dans Supabase via Zoho Mail.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-gold/20 bg-background/70 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 text-gold font-medium">
                <Mail className="h-4 w-4" />
                <span>{recipientCount} destinataire{recipientCount > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Objet du mail</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet du message"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Préheader (optionnel)</Label>
                <Input
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Résumé visible dans la boîte mail"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as NewsletterFormat)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir le format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML / CSS</SelectItem>
                    <SelectItem value="text">Texte simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  placeholder="Rédigez votre message ici. Le contenu accepte du HTML si vous choisissez le format HTML."
                  className="min-h-[260px] resize-y"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="hero" onClick={handleSend} disabled={sending} className="gap-2">
                  <SendHorizonal className="h-4 w-4" />
                  {sending ? "Envoi en cours…" : "Envoyer à tous les abonnés"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Card className="border-border/60 bg-muted/20">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Prérequis
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• La table Supabase <span className="font-medium text-foreground">newsletter_subscribers</span> doit contenir des abonnés actifs.</li>
                    <li>• Les variables Zoho Mail doivent être configurées sur le projet Supabase.</li>
                    <li>• Le message peut contenir du HTML ou du texte selon votre choix.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Prévisualisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {subject || "Objet du mail"}
                  </div>
                  {format === "html" ? (
                    <div className="rounded-2xl border border-border/60 bg-background p-3 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: preview.html }} />
                  ) : (
                    <div className="rounded-2xl border border-border/60 bg-background p-3 text-sm whitespace-pre-wrap text-foreground">
                      {preview.text}
                    </div>
                  )}
                </CardContent>
              </Card>

              {lastResult && (
                <div className={`flex items-start gap-2 rounded-2xl border px-3 py-3 text-sm ${lastResult.toLowerCase().includes("échec") || lastResult.toLowerCase().includes("impossible") ? "border-red-500/30 bg-red-500/10 text-red-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"}`}>
                  {lastResult.toLowerCase().includes("échec") || lastResult.toLowerCase().includes("impossible") ? <AlertCircle className="mt-0.5 h-4 w-4" /> : <CheckCircle2 className="mt-0.5 h-4 w-4" />}
                  <span>{lastResult}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterCampaigns;
