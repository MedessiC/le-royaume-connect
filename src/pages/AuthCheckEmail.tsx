import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiOutlineMail } from "react-icons/ai";

const AuthCheckEmail = () => {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border border-border bg-card/90 shadow-royal">
        <CardHeader className="text-center py-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold">
            <AiOutlineMail className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-display">Vérifiez votre boîte mail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10 pt-2 text-center">
          <p className="text-sm text-muted-foreground">
            Nous avons envoyé un lien de confirmation à
          </p>
          <p className="break-words text-base font-semibold text-foreground">{email ?? "votre adresse e-mail"}</p>
          <p className="text-sm text-muted-foreground">
            Ouvrez votre messagerie, puis cliquez sur le lien pour activer votre compte et revenir sur la plateforme.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/auth">Retour à la page de connexion</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCheckEmail;
