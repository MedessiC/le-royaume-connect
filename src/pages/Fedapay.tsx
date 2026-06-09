import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const FEDAPAY_PAYMENT_LINK = import.meta.env.VITE_FEDAPAY_PAYMENT_LINK as string | undefined;
const DONATION_CURRENCY = (import.meta.env.VITE_DONATION_CURRENCY as string | undefined) ?? 'EUR';

const formatPaymentLink = (link: string, amount: number | null) => {
  if (!link) return null;
  let formatted = link.replace(/{{\s*amount\s*}}/gi, amount ? encodeURIComponent(String(amount)) : '').replace(/{{\s*currency\s*}}/gi, encodeURIComponent(DONATION_CURRENCY));
  if (amount && !/amount=/i.test(formatted)) {
    const sep = formatted.includes('?') ? '&' : '?';
    formatted += `${sep}amount=${encodeURIComponent(String(amount))}&currency=${encodeURIComponent(DONATION_CURRENCY)}`;
  }
  return formatted;
};

export default function FedapayPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCheckout = async () => {
    const numeric = Number(amount.replace(/[^0-9]/g, ''));
    if (!numeric || numeric <= 0) {
      toast({ title: 'Montant invalide', description: 'Entrez un montant valide en FCFA.' });
      return;
    }

    setLoading(true);

    // First, try server-side creation (Netlify function)
    try {
      const resp = await fetch('/.netlify/functions/create-fedapay-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numeric, currency: DONATION_CURRENCY, description: 'Donation' }),
      });

      const data = await resp.json();
      if (resp.ok && data.url) {
        window.open(data.url, '_blank');
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore and fallback to client link
    }

    // Fallback: open public payment link template if configured
    if (FEDAPAY_PAYMENT_LINK) {
      const url = formatPaymentLink(FEDAPAY_PAYMENT_LINK, numeric);
      if (url) window.open(url, '_blank');
      else toast({ title: 'Erreur', description: 'Lien Fedapay mal configuré.' });
    } else {
      toast({ title: 'Non configuré', description: 'Aucun lien Fedapay configuré côté client et la fonction serveur a échoué.' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 container mx-auto px-4 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-4">Payer avec Fedapay</h1>

        <div className="rounded-lg border border-border p-6 bg-background">
          <div className="grid gap-3">
            <Label htmlFor="fedapay-amount">Montant (FCFA)</Label>
            <Input id="fedapay-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" />
            <div className="flex gap-3 mt-4">
              <Button onClick={createCheckout} disabled={loading}>
                {loading ? 'Ouverture...' : 'Payer avec Fedapay'}
              </Button>
              <Button variant="secondary" onClick={() => setAmount('')}>Effacer</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">La page essaiera d’utiliser une fonction serveur si disponible, sinon ouvrira un lien public configuré.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
