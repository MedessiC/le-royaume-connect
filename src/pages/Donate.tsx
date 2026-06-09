import { type ElementType, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Copy, Check } from "lucide-react";
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaBitcoin, FaMobileAlt, FaMoneyBillWave } from "react-icons/fa";

import { useToast } from "@/hooks/use-toast";

type Donation = {
  label: string;
  value: string;
  hint?: string;
};

type PaymentProvider = {
  id: string;
  label: string;
  description: string;
  url: string;
  note?: string;
  icon?: ElementType;
};

const Donate = () => {
  const quickAmounts = [5000, 10000, 20000, 50000, 100000];
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string | undefined;
  const PAYPAL_BUSINESS_ID = import.meta.env.VITE_PAYPAL_BUSINESS_ID as string | undefined;
  const FEDAPAY_PUBLIC = import.meta.env.VITE_FEDAPAY_PUBLIC as string | undefined;
  const FEDAPAY_PAYMENT_LINK = import.meta.env.VITE_FEDAPAY_PAYMENT_LINK as string | undefined;
  const DONATION_PAYMENT_LINK = import.meta.env.VITE_DONATION_PAYMENT_LINK as string | undefined;
  const DONATION_CURRENCY = (import.meta.env.VITE_DONATION_CURRENCY as string | undefined) ?? "EUR";
  const [fedapayReady, setFedapayReady] = useState(false);
  const [fedapayLoadError, setFedapayLoadError] = useState(false);

  const amountValue = customAmount.trim()
    ? Number(customAmount.replace(/[^0-9]/g, ""))
    : selectedAmount ?? 0;

  const formatPaymentLink = (link: string) => {
    const amount = amountValue > 0 ? amountValue : null;
    let formatted = link
      .replace(/{{\s*amount\s*}}/gi, amount ? encodeURIComponent(amount.toString()) : "")
      .replace(/{{\s*currency\s*}}/gi, encodeURIComponent(DONATION_CURRENCY));

    if (amount && !/[[{]?amount[}\]]?/i.test(link)) {
      const separator = formatted.includes("?") ? "&" : "?";
      if (!formatted.includes("amount=")) {
        formatted += `${separator}amount=${encodeURIComponent(amount.toString())}`;
      }
      if (!formatted.includes("currency=")) {
        formatted += `&currency=${encodeURIComponent(DONATION_CURRENCY)}`;
      }
    }

    return formatted;
  };

  const payPalUrl = PAYPAL_BUSINESS_ID
    ? `https://www.paypal.com/donate?business=${encodeURIComponent(PAYPAL_BUSINESS_ID)}&currency_code=${encodeURIComponent(DONATION_CURRENCY)}${amountValue ? `&amount=${amountValue}` : ""}`
    : null;

  const paymentProviders: PaymentProvider[] = [
    STRIPE_PAYMENT_LINK
      ? {
          id: "stripe",
          label: "Stripe",
          description: "Lien de paiement Stripe sécurisé pour cartes et agrégateurs.",
          url: formatPaymentLink(STRIPE_PAYMENT_LINK),
          note: "Configurez Stripe pour recevoir les dons en Mobile Money via votre solution connectée.",
          icon: FaCcVisa,
        }
      : null,
    payPalUrl
      ? {
          id: "paypal",
          label: "PayPal",
          description: "Donnez facilement avec PayPal, en devise EUR ou USD selon votre compte.",
          url: payPalUrl,
          note: "Le don s’effectue sur PayPal et peut être lié à votre compte professionnel.",
          icon: FaCcPaypal,
        }
      : null,
    FEDAPAY_PAYMENT_LINK
      ? {
          id: "fedapay",
          label: "Fedapay",
          description: "Paiement via Fedapay, compatible cartes et Mobile Money.",
          url: formatPaymentLink(FEDAPAY_PAYMENT_LINK),
          note: "Fedapay peut collecter puis transférer vers un compte Mobile Money configuré.",
          icon: FaMobileAlt,
        }
      : null,
    DONATION_PAYMENT_LINK
      ? {
          id: "link",
          label: "Agrégateur externe",
          description: "Lien direct vers votre plateforme de paiement configurée.",
          url: formatPaymentLink(DONATION_PAYMENT_LINK),
          note: "Utilisez votre fournisseur existant pour centraliser les dons.",
          icon: FaMoneyBillWave,
        }
      : null,
  ].filter(Boolean) as PaymentProvider[];

  const simulationProvider: PaymentProvider = {
    id: "simulate",
    label: "Simulation",
    description: "Mode test : simule un paiement sans service réel configuré.",
    url: "",
    note: "Aucun agrégateur réel n’est configuré. Le paiement est simulé pour les tests.",
    icon: FaMoneyBillWave,
  };

  const displayProviders = paymentProviders.length > 0 ? paymentProviders : [simulationProvider];
  const hasOnlinePayment = displayProviders.length > 0;

  useEffect(() => {
    document.title = "Faire un don – MILLENIUM";
  }, []);

  useEffect(() => {
    if (!FEDAPAY_PUBLIC) {
      setFedapayReady(false);
      return;
    }

    const scriptId = "fedapay-checkout-js";
    if (document.getElementById(scriptId)) {
      setFedapayReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    script.async = true;
    script.onload = () => setFedapayReady(true);
    script.onerror = () => setFedapayLoadError(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [FEDAPAY_PUBLIC]);

  const openFedapayCheckout = async (amount: number) => {
    if (!FEDAPAY_PUBLIC || !fedapayReady || fedapayLoadError) {
      return false;
    }

    const fedapay = (window as any).FedaPay;
    if (!fedapay) {
      return false;
    }

    try {
      const widget = fedapay.init({
        public_key: FEDAPAY_PUBLIC,
        transaction: {
          amount,
          description: "Donation MILLENIUM",
          currency_iso: DONATION_CURRENCY,
        },
      });

      if (widget?.open) {
        widget.open();
      }
      return true;
    } catch (error) {
      console.error("Fedapay init error", error);
      return false;
    }
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    toast({ title: "Copié", description: `${label} copié dans le presse-papier` });
    setTimeout(() => setCopied(null), 2000);
  };

  const simulatePayment = () => {
    toast({ title: "Paiement simulé", description: `Donation simulée de ${amountValue.toLocaleString()} FCFA.` });
    setModalOpen(false);
  };

  const openProviderLink = async (provider: PaymentProvider) => {
    if (provider.id === "simulate") {
      simulatePayment();
      return;
    }

    if (provider.id === "fedapay") {
      if (!amountValue || amountValue <= 0) {
        toast({ title: "Montant requis", description: "Sélectionnez ou saisissez un montant avant de payer avec Fedapay." });
        return;
      }

      if (FEDAPAY_PUBLIC && fedapayReady && !fedapayLoadError) {
        const opened = await openFedapayCheckout(amountValue);
        if (opened) {
          setModalOpen(false);
          return;
        }
      }

      // Try server-side checkout creation if client checkout doesn't work
      try {
        const resp = await fetch("/.netlify/functions/create-fedapay-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountValue, currency: DONATION_CURRENCY, description: "Donation" }),
        });
        const data = await resp.json();
        if (resp.ok && (data.url || data.checkout_url || data.redirect_url)) {
          const url = data.url || data.checkout_url || data.redirect_url;
          window.open(url, "_blank");
          setModalOpen(false);
          return;
        }
      } catch (err) {
        console.error("Fedapay server checkout failed", err);
      }

      if (provider.url) {
        window.open(provider.url, "_blank");
        setModalOpen(false);
        return;
      }

      toast({ title: "Erreur Fedapay", description: "Impossible de lancer le paiement Fedapay." });
      setModalOpen(false);
      return;
    }

    if (provider.url) window.open(provider.url, "_blank");
    else toast({ title: "Erreur", description: "Lien de paiement non configuré." });
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-hero text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center max-w-5xl">
            <Heart className="w-16 h-16 mx-auto text-gold mb-6" />
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Page de dons internationale</h1>
            <p className="text-lg text-primary-foreground/85 font-body leading-relaxed mx-auto max-w-3xl">
              Donnez en ligne avec un agrégateur sécurisé, par Mobile Money en Afrique ou par virement international.
              La page est conçue pour recevoir les dons clairement et directement via vos services de paiement préférés.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/10 px-4 py-2">
                <FaCcVisa className="h-4 w-4 text-primary-foreground" />
                Visa
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/10 px-4 py-2">
                <FaCcMastercard className="h-4 w-4 text-primary-foreground" />
                Mastercard
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/10 px-4 py-2">
                <FaCcPaypal className="h-4 w-4 text-primary-foreground" />
                PayPal
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/10 px-4 py-2">
                <FaBitcoin className="h-4 w-4 text-primary-foreground" />
                Crypto
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/10 px-4 py-2">
                <FaMobileAlt className="h-4 w-4 text-primary-foreground" />
                MTN & Moov
              </div>
            </div>

            <div className="mt-12 rounded-[2rem] border border-border bg-background/90 p-8 shadow-xl shadow-black/5">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Choisissez votre montant</p>
                  <div className="flex flex-wrap gap-3">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={selectedAmount === amt && !customAmount ? "hero" : "outline"}
                        className="min-w-[110px]"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                      >
                        {amt.toLocaleString()} FCFA
                      </Button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-2">
                    <Label htmlFor="donation-amount">Montant personnalisé</Label>
                    <Input
                      id="donation-amount"
                      type="text"
                      value={customAmount}
                      placeholder="25000"
                      onChange={(event) => {
                        const value = event.target.value.replace(/[^0-9]/g, "");
                        setCustomAmount(value);
                        setSelectedAmount(null);
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Entrez votre montant en FCFA. Si vous utilisez Stripe ou Fedapay, le service peut convertir la devise si nécessaire.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => setModalOpen(true)}
                      disabled={!hasOnlinePayment}
                    >
                      Ouvrir le paiement en ligne
                    </Button>
                  </div>

                  {!hasOnlinePayment && (
                    <p className="mt-4 text-sm text-destructive">
                      Aucun agrégateur configuré. Ajoutez Stripe, Fedapay, PayPal ou un lien d’agrégateur dans votre configuration.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-border bg-primary/5 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary mb-4">Agrégateurs disponibles</p>
                  <div className="space-y-4">
                    {displayProviders.length > 0 ? (
                      displayProviders.map((provider) => (
                        <div key={provider.id} className="rounded-2xl bg-background p-4 border border-border">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {provider.icon ? (
                                <provider.icon className="h-6 w-6 text-primary-foreground" />
                              ) : null}
                              <div>
                                <h3 className="font-semibold">{provider.label}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => openProviderLink(provider)}>
                              Payer
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun mode de paiement en ligne n’est configuré pour le moment.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                  <p className="font-semibold mb-1">Montant choisi</p>
                  <p>{amountValue > 0 ? `${amountValue.toLocaleString()} FCFA` : "Aucun montant sélectionné"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                  <p className="font-semibold mb-1">Livraison</p>
                  <p>Carte, PayPal, Fedapay ou lien externe selon votre configuration.</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                  <p className="font-semibold mb-1">Réception MoMo</p>
                  <p>Si l’agrégateur est configuré, le don peut être transféré directement sur un compte Mobile Money.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choisissez votre mode de paiement</DialogTitle>
            <DialogDescription>
              Sélectionnez un agrégateur et utilisez le montant choisi pour payer en ligne.
              Le service peut recevoir des fonds par carte ou Mobile Money selon la configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-border bg-secondary/50 p-5">
              <p className="text-sm text-muted-foreground">
                Montant choisi : <span className="font-semibold text-foreground">{amountValue > 0 ? `${amountValue.toLocaleString()} FCFA` : "Aucun montant sélectionné"}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Si vous n’avez pas choisi de montant, le don pourra être finalisé depuis la page de paiement du fournisseur.
              </p>
            </div>

            {hasOnlinePayment ? (
              <div className="grid gap-4">
                {displayProviders.map((provider) => (
                  <Card key={provider.id} className="border border-border">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">{provider.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                      {provider.note && <p className="text-sm text-muted-foreground">{provider.note}</p>}
                      <Button size="lg" className="w-full" onClick={() => openProviderLink(provider)}>
                        Payer avec {provider.label}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-5">
                <p className="text-sm text-destructive">Aucun agrégateur n’est configuré. Merci de contacter l’équipe pour activer Stripe, Fedapay, PayPal ou votre lien de paiement.</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Donate;
