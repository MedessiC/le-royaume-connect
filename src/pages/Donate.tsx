import { useState } from "react";
import { FeexPayProvider, FeexPayButton } from "@feexpay/react-sdk";
import "@feexpay/react-sdk/style.css";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Gift, Users, TrendingUp, CheckCircle } from "lucide-react";

const Donate = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(10000);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");

  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  // FeexPay Configuration - Récupère depuis les variables d'environnement
  const feexpayShopId = import.meta.env.VITE_FEEXPAY_SHOP_ID || "Ayg9lkjkhurIvNp";
  const feexpayToken =
    import.meta.env.VITE_FEEXPAY_TOKEN ||
    "fp_HHNoQGt9Vn8KpZoLaBkG3uEeKpLUYBaHUZIZXJE3Xgv0OKG2tK3A7PtlytctikrT";
  const feexpayMode = import.meta.env.VITE_FEEXPAY_MODE || "SANDBOX";

  const handleQuickAmount = (value: number) => {
    setAmount(value);
    setShowCustomAmount(false);
    setCustomAmount("");
  };

  const handleCustomAmount = () => {
    if (customAmount && Number(customAmount) > 0) {
      setAmount(Number(customAmount));
      setShowCustomAmount(false);
      setCustomAmount("");
    } else {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
    }
  };

  const handlePaymentCallback = (response: any) => {
    console.log("FeexPay Response:", response);

    if (response?.status === "success" || response?.success) {
      toast({
        title: "✅ Merci pour votre donation!",
        description: `Donation de ${amount.toLocaleString()} XOF confirmée avec succès.`,
        duration: 5000,
      });
      // Réinitialiser le formulaire
      setAmount(10000);
      setDonorName("");
      setDonorEmail("");
      setDonorPhone("");
    } else if (response?.status === "pending" || response?.pending) {
      toast({
        title: "⏳ Paiement en attente",
        description: "Votre paiement est en cours de traitement.",
      });
    } else {
      toast({
        title: "Paiement annulé",
        description: "La transaction a été annulée.",
        variant: "destructive",
      });
    }
  };

  const generateCustomId = () => {
    return `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const benefits = [
    {
      icon: Heart,
      title: "Impact Direct",
      description: "Votre donation soutient directement nos enseignements",
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Rejoignez des milliers de donateurs engagés",
    },
    {
      icon: TrendingUp,
      title: "Croissance",
      description: "Aidez le Royaume à grandir et se développer",
    },
    {
      icon: Gift,
      title: "Reconnaissance",
      description: "Recevez des remerciements et des privilèges",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Choisir le montant",
      description: "Sélectionnez parmi les montants prédéfinis ou entrez un montant personnalisé",
    },
    {
      number: 2,
      title: "Remplir vos données",
      description: "Entrez votre nom, email et numéro de téléphone",
    },
    {
      number: 3,
      title: "Sécuriser le paiement",
      description: "Cliquez sur le bouton FeexPay pour effectuer le paiement",
    },
    {
      number: 4,
      title: "Confirmation",
      description: "Recevez immédiatement une confirmation de votre donation",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <Navbar />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Soutenez le Royaume
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Votre générosité nous aide à propager les enseignements et à renforcer notre 
            communauté dans toute l'Afrique de l'Ouest. Chaque donation, même petite, 
            fait une grande différence.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Main Donation Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 mb-16">
          <FeexPayProvider>
            <div className="space-y-10">
              {/* Amount Selection */}
              <div>
                <Label className="text-lg font-bold text-slate-900 mb-6 block">
                  📊 Choisissez un montant de donation
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className={`p-4 rounded-xl font-bold transition-all transform duration-200 ${
                        amount === value && !showCustomAmount
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-105 ring-2 ring-blue-300"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200 hover:scale-105"
                      }`}
                    >
                      <div className="text-sm">{(value / 1000).toFixed(0)}K</div>
                      <div className="text-xs">XOF</div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount Toggle */}
                <button
                  onClick={() => {
                    setShowCustomAmount(!showCustomAmount);
                    setCustomAmount("");
                  }}
                  className={`w-full p-4 rounded-xl font-bold transition-all ${
                    showCustomAmount
                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-900 border-2 border-green-600"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-transparent"
                  }`}
                >
                  {showCustomAmount ? "✏️ Montant personnalisé" : "➕ Montant personnalisé"}
                </button>

                {/* Custom Amount Input */}
                {showCustomAmount && (
                  <div className="mt-4 space-y-3">
                    <Input
                      type="number"
                      placeholder="Entrez le montant en XOF"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="text-lg py-3"
                      min="100"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCustomAmount}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                      >
                        Valider
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCustomAmount(false);
                          setCustomAmount("");
                        }}
                        variant="outline"
                        className="flex-1 py-3"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-8 border-2 border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">💰 Montant à donner</p>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {amount.toLocaleString()}
                  </p>
                  <p className="text-xl text-slate-700 mt-2">XOF</p>
                </div>
              </div>

              {/* Donor Information */}
              <div className="space-y-4">
                <Label className="text-lg font-bold text-slate-900 block">
                  👤 Informations du donateur
                </Label>
                <Input
                  type="text"
                  placeholder="Votre nom"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="py-3"
                />
                <Input
                  type="email"
                  placeholder="Votre email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="py-3"
                />
                <Input
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="py-3"
                />
              </div>

              {/* Payment Methods Available */}
              <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-600">
                <p className="text-sm font-bold text-slate-900 mb-4">
                  🌐 Méthodes de paiement disponibles:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["MTN Mobile Money", "Moov Africa", "Celtiis", "Carte Bancaire"].map((method) => (
                    <div
                      key={method}
                      className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-blue-300"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FeexPay Button */}
              <div className="flex justify-center pt-6">
                <FeexPayButton
                  amount={amount}
                  description="Donation pour le Royaume"
                  token={feexpayToken}
                  id={feexpayShopId}
                  customId={generateCustomId()}
                  mode={feexpayMode}
                  currency="XOF"
                  callback={handlePaymentCallback}
                  callback_info={{
                    fullname: donorName || "Donateur",
                    email: donorEmail || "donation@royaume.com",
                    phone: donorPhone || "00000",
                  }}
                  buttonClass="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl text-lg"
                  buttonText="🔐 Procéder au paiement FeexPay"
                />
              </div>

              {/* Security Info */}
              <div className="text-center text-sm text-slate-600 bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="font-semibold text-green-800">
                  ✅ Paiement 100% sécurisé via FeexPay
                </p>
                <p className="text-xs mt-1">Vos données bancaires sont cryptées et protégées</p>
              </div>
            </div>
          </FeexPayProvider>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
            Pourquoi soutenir le Royaume?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow transform hover:scale-105"
                >
                  <Icon className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            ❓ Questions fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Puis-je modifier mon montant?
              </h3>
              <p className="text-slate-600">
                Bien sûr! Vous pouvez choisir parmi les montants proposés ou entrer 
                un montant personnalisé avant de procéder au paiement.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Quelles méthodes acceptez-vous?
              </h3>
              <p className="text-slate-600">
                Nous acceptons MTN Mobile Money, Moov Africa, Celtiis et les 
                cartes bancaires via FeexPay.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Ma donation est-elle sécurisée?
              </h3>
              <p className="text-slate-600">
                Oui! Tous les paiements sont sécurisés par FeexPay avec le 
                chiffrement SSL 256-bit.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Quand reçoive-je une confirmation?
              </h3>
              <p className="text-slate-600">
                Vous recevez une confirmation immédiate par email et SMS après 
                le paiement réussi.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Mes données sont-elles confidentielles?
              </h3>
              <p className="text-slate-600">
                Absolument! Vos informations personnelles ne sont jamais stockées 
                sur nos serveurs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Comment puis-je faire un paiement récurrent?
              </h3>
              <p className="text-slate-600">
                Contactez-nous directement pour mettre en place un don récurrent 
                via email ou téléphone.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Prêt à faire la différence?</h2>
          <p className="text-lg mb-8 opacity-90">
            Chaque donation, peu importe la taille, nous aide à continuer notre mission. 
            Merci pour votre soutien!
          </p>
          <p className="text-sm opacity-75">
            Vos dons aident le Royaume à créer un impact durable dans les communautés
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
