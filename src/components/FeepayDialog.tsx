import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FaMobileAlt } from 'react-icons/fa';
import {
  initiateFeepayPayment,
  formatPhoneNumber,
  validatePhoneNumber,
  getNetworkInfo,
  type FeepayNetwork,
  type FeepayRequestPayload,
} from '@/lib/feepay';
import { useToast } from '@/hooks/use-toast';

interface FeepayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onPaymentSuccess?: (reference: string) => void;
  onPaymentError?: (error: string) => void;
}

export const FeepayDialog = ({
  open,
  onOpenChange,
  amount,
  onPaymentSuccess,
  onPaymentError,
}: FeepayDialogProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState<FeepayNetwork>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const networks: FeepayNetwork[] = ['mtn', 'moov', 'celtiis'];

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validate phone number
      if (!phoneNumber.trim()) {
        setError('Veuillez entrer votre numéro de téléphone');
        return;
      }

      if (!validatePhoneNumber(phoneNumber, selectedNetwork)) {
        setError('Numéro de téléphone invalide. Doit être un numéro 10 chiffres avec préfixe 229');
        return;
      }

      setIsLoading(true);

      const formattedPhone = formatPhoneNumber(phoneNumber, selectedNetwork);

      const payload: FeepayRequestPayload = {
        phoneNumber: formattedPhone,
        amount: Math.round(amount),
        shop: import.meta.env.VITE_FEEPAY_SHOP_ID || '',
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        description: 'Donation MILLENIUM',
        callbackInfo: `donation_${Date.now()}`,
      };

      const response = await initiateFeepayPayment(selectedNetwork, payload);

      if (!response) {
        throw new Error('Impossible de traiter la demande FeePay. Vérifiez votre connexion et réessayez.');
      }

      if (response.status === 'FAILED') {
        const errorMsg =
          response.response_operator?.description?.[0] ||
          response.message ||
          'La demande de paiement a échoué';
        throw new Error(errorMsg);
      }

      // Success - payment initiated
      toast({
        title: 'Paiement initié',
        description: `Une requête de paiement a été envoyée à votre numéro ${formattedPhone}. Confirmez sur votre téléphone.`,
      });

      onPaymentSuccess?.(response.reference);
      setPhoneNumber('');
      setFirstName('');
      setLastName('');
      onOpenChange(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMsg);
      onPaymentError?.(errorMsg);
      toast({
        title: 'Erreur de paiement',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const networkInfo = getNetworkInfo(selectedNetwork);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaMobileAlt className="h-5 w-5" />
            Paiement par Mobile Money
          </DialogTitle>
          <DialogDescription>
            Sélectionnez votre opérateur et entrez vos informations pour effectuer un don via FeePay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Amount Display */}
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground">Montant du don</p>
            <p className="text-2xl font-semibold text-foreground">
              {amount.toLocaleString()} FCFA
            </p>
          </div>

          {/* Network Selection */}
          <div>
            <Label className="mb-3 block text-base font-semibold">Sélectionnez votre opérateur</Label>
            <Tabs value={selectedNetwork} onValueChange={(val) => setSelectedNetwork(val as FeepayNetwork)}>
              <TabsList className="grid w-full grid-cols-3">
                {networks.map((net) => (
                  <TabsTrigger key={net} value={net}>
                    {getNetworkInfo(net).label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {networks.map((net) => (
                <TabsContent key={net} value={net} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{getNetworkInfo(net).description}</p>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Phone Number Input */}
          <div>
            <Label htmlFor="feepay-phone" className="text-base font-semibold">
              Numéro de téléphone
            </Label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">+229</span>
              <Input
                id="feepay-phone"
                type="tel"
                placeholder="01 23 45 67 89"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhoneNumber(val.slice(0, 10)); // Max 10 digits
                }}
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Entrez 10 chiffres. Exemple: 0166000000 ou 2290166000000
            </p>
          </div>

          {/* Optional Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="feepay-firstName" className="text-sm font-medium">
                Prénom (optionnel)
              </Label>
              <Input
                id="feepay-firstName"
                type="text"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="feepay-lastName" className="text-sm font-medium">
                Nom (optionnel)
              </Label>
              <Input
                id="feepay-lastName"
                type="text"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">Erreur</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-border bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>À savoir:</strong> Une notification sera envoyée à votre téléphone. Confirmez la transaction pour compléter votre don.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !phoneNumber}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              'Confirmer le paiement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
