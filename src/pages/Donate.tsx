import { FormEvent, useState } from "react";
import FlagIcon from "@/components/FlagIcon";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

type ContactNumber = {
  country: "Bénin" | "Côte d'Ivoire";
  number: string;
  tone: "gold" | "green";
};

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? "contact@leregnemillenaire.com";
const contactNumbers: ContactNumber[] = [
  { country: "Côte d'Ivoire", number: "+225 27 24 46 68 06", tone: "gold" },
  { country: "Côte d'Ivoire", number: "+225 07 592 32944", tone: "gold" },
  { country: "Bénin", number: import.meta.env.VITE_BENIN_PHONE_1 ?? "", tone: "gold" },
  { country: "Bénin", number: import.meta.env.VITE_BENIN_PHONE_2 ?? "", tone: "gold" },
  { country: "Bénin", number: import.meta.env.VITE_BENIN_PHONE_3 ?? "", tone: "gold" },
  { country: "Côte d'Ivoire", number: import.meta.env.VITE_CI_PHONE_1 ?? "", tone: "green" },
  { country: "Côte d'Ivoire", number: import.meta.env.VITE_CI_PHONE_2 ?? "", tone: "green" },
];
const whatsappUrl = import.meta.env.VITE_WHATSAPP_URL ?? "";

// FlagIcon component provides SVG flags for countries

const phoneHref = (number: string) => `tel:${number.replace(/[^\d+]/g, "")}`;
const whatsappHref = (number: string) => {
  const normalized = number.replace(/\D/g, "");
  return normalized ? `https://wa.me/${normalized}` : whatsappUrl;
};

const Donate = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Soutenir le Règne Millénaire");
  const [message, setMessage] = useState(
    "Bonjour, je souhaite soutenir la mission du Règne Millénaire. Je voudrais échanger avec votre équipe au sujet des modalités de soutien.",
  );
  const [phonePanelOpen, setPhonePanelOpen] = useState(false);

  const availableNumbers = contactNumbers.filter((contact) => contact.number);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [`Nom : ${name}`, `Email : ${email}`, `Téléphone : ${phone}`, "", message].join("\n");
    const destination = contactEmail || "contact@votre-organisation.com";

    window.location.href = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast({
      title: "Votre messagerie va s'ouvrir",
      description: "Vérifiez le message puis envoyez-le à l'organisation.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title="Contacter MILLENIUM | Soutenir la mission"
        description="Contactez directement l'organisation MILLENIUM par email, téléphone, WhatsApp ou formulaire pour soutenir la mission."
        path="/donate"
        keywords={["contact MILLENIUM", "soutenir ZOVIZO", "WhatsApp Règne Millénaire", "contact Bénin", "contact Côte d'Ivoire"]}
      />
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-950 px-4 pb-16 pt-20 text-white md:pb-24 md:pt-28">
          <img
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1800&q=90&v=4"
            alt="Personnes noires réunies pour soutenir une mission solidaire"
            loading="eager"
            className="absolute inset-0 z-0 h-full w-full object-cover object-[center_40%] opacity-80"
          />
          <div className="absolute inset-0 z-0 bg-slate-950/25" />
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_75%_20%,hsl(43_92%_50%_/_0.12),transparent_32%),linear-gradient(135deg,hsl(228_72%_16%_/_0.45),hsl(222_40%_8%_/_0.65))]" />
          <div className="relative mx-auto max-w-5xl">
            <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-gold">
              <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
            </Link>
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3 text-gold">
                <Heart className="h-8 w-8 fill-current" />
                <span className="text-xs font-bold uppercase tracking-[0.22em]">Soutenir la mission</span>
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">Parlons directement.</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                Pour faire un don, demander les modalités de soutien ou poser une question, contactez l'organisation par le moyen qui vous convient le mieux.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[0.85fr_1.15fr] md:py-20">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">Coordonnées officielles</p>
            <h2 className="font-display text-3xl font-bold text-foreground">Choisissez votre canal</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Notre équipe peut vous renseigner sur les dons directs, les besoins de la mission et les différentes manières de contribuer.
            </p>

            <div className="mt-7 space-y-3">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/50 hover:bg-gold/5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold"><Mail className="h-5 w-5" /></span>
                  <span><strong className="block text-sm text-foreground">Email</strong><span className="text-xs text-muted-foreground">{contactEmail}</span></span>
                </a>
              )}

              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600"><MessageCircle className="h-5 w-5" /></span>
                  <span><strong className="block text-sm text-foreground">WhatsApp de l'organisation</strong><span className="text-xs text-muted-foreground">Réponse directe de l'équipe</span></span>
                </a>
              )}

              {availableNumbers.map((contact) => (
                <div key={`${contact.country}-${contact.number}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${contact.tone === "gold" ? "bg-gold/15 text-gold" : "bg-emerald-500/15 text-emerald-600"}`}><Phone className="h-5 w-5" /></span>
                    <span><strong className="block text-sm text-foreground"><FlagIcon country={contact.country} className="inline-block h-4 w-6 mr-2 flex-shrink-0" /></strong><span className="text-sm text-muted-foreground">{contact.number}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={phoneHref(contact.number)} aria-label={`Appeler le ${contact.number}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Phone className="h-4 w-4" /></a>
                    <a href={whatsappHref(contact.number)} target="_blank" rel="noreferrer noopener" aria-label={`Contacter le ${contact.number} par WhatsApp`} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-500/10"><MessageCircle className="h-4 w-4" /></a>
                  </div>
                </div>
              ))}
            </div>

            {!contactEmail && !whatsappUrl && availableNumbers.length === 0 && (
              <div className="mt-7 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-muted-foreground">
                <MapPin className="mb-2 h-5 w-5 text-gold" />
                Les coordonnées officielles seront bientôt disponibles. Le formulaire ci-contre reste utilisable dès que l'adresse email sera configurée.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-gold/20 bg-card p-6 shadow-lg md:p-8">
            <div className="mb-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">Formulaire de contact</p>
              <h2 className="font-display text-2xl font-bold text-foreground">Écrivez-nous</h2>
              <p className="mt-2 text-sm text-muted-foreground">Votre messagerie s'ouvrira avec un message déjà préparé.</p>
            </div>
            <div className="space-y-4">
              <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold" />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre adresse email" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold" />
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Votre numéro de téléphone" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold" />
              <input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Objet" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold" />
              <textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Votre message" className="w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold" />
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-slate-950 transition-colors hover:bg-gold-light">
                <Send className="h-4 w-4" /> Préparer mon email
              </button>
            </div>
          </form>
        </section>

        <section className="border-t border-border bg-muted/30 px-4 py-12">
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {["Une équipe à votre écoute", "Des modalités expliquées clairement", "Un soutien qui fait la différence"].map((title) => (
              <div key={title} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                <p className="text-sm font-semibold text-foreground">{title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {phonePanelOpen && (
          <div className="w-72 rounded-2xl border border-emerald-500/20 bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600">
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Nous appeler directement</span>
              <button type="button" onClick={() => setPhonePanelOpen(false)} aria-label="Fermer les numéros" className="rounded-full p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2">
              {availableNumbers.length > 0 ? availableNumbers.map((contact) => (
                <a
                  key={`${contact.country}-${contact.number}`}
                  href={phoneHref(contact.number)}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald-500/40 hover:text-emerald-600"
                >
                  <span><FlagIcon country={contact.country} className="inline-block h-3.5 w-5 mr-2" />{contact.number}</span>
                  <Phone className="h-4 w-4" />
                </a>
              )) : (
                <p className="text-xs leading-relaxed text-muted-foreground">Les numéros de téléphone seront bientôt disponibles.</p>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPhonePanelOpen((open) => !open)}
          aria-label="Nous appeler directement"
          title="Nous appeler directement"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-background bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition-transform hover:scale-110 hover:bg-emerald-700 active:scale-95"
        >
          {phonePanelOpen ? <X className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Donate;
