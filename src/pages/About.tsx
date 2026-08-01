import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MapComponent from "@/components/MapComponent";
import GoldBadge from "@/components/GoldBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cross,
  Users,
  Globe,
  Heart,
  BookOpen,
  Crown,
  Shield,
  Flame,
  Scroll,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  Music,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   DONNÉES AUTHENTIQUES
───────────────────────────────────────────── */

const zovizoBioData = [
  { label: "Nom de naissance", value: "Moucharafou Dîne YESSOUFOU", icon: Scroll, protect: true },
  { label: "Date de naissance", value: "07 Avril 1987 à 01h43", icon: Calendar, protect: false },
  { label: "Lieu de naissance", value: "Cotonou, Bénin (Gbégamey)", icon: MapPin, protect: false },
  { label: "Nationalité", value: "Béninoise — Marié avec enfants", icon: Globe, protect: false },
  { label: "Ascendance", value: "Mère : KAKPO SEKAN Gisèle (Guezin Zikpanou)", icon: Users, protect: true },
  { label: "Tutelle", value: "Collectivité FANOUVI LOKOSSOU Codjo Ferdinand (Bopa)", icon: Shield, protect: true },
  { label: "Révélation officielle", value: "07 Avril 2023 — « Mon nom est ZOVIZO »", icon: Crown, protect: false },
  { label: "Signification de ZOVIZO", value: "Enfant du FEU qui est FEU — Issu du Saint-Esprit", icon: Flame, protect: false },
];

const zovizoParcours = [
  {
    icon: Globe,
    title: "Parcours Professionnel",
    desc: "Transit maritime au Port Autonome de Cotonou, exportateur de bois vers la Chine (2010–2013), expertises en plomberie et ferronnerie à Malanville, Tanguiéta, Porto-Novo et Bohicon.",
  },
  {
    icon: Music,
    title: "Œuvre Musicale & Artistique",
    desc: "Auteur-compositeur-interprète de plus de 6 compositions spirituelles dédiées à l'extension du Règne Millénaire.",
  },
  {
    icon: Heart,
    title: "Mission Spirituelle de Baptême",
    desc: "Baptisé dans plusieurs congrégations pour briser les chaînes sataniques qui lient le peuple de Dieu et les libérer totalement.",
  },
];

const nomEtymologie = [
  {
    mot: "MOUCHARAFOU",
    origine: "Arabe",
    sens: "Honorable, Noble — Titre de haute valeur attribué aux leaders et notables.",
  },
  {
    mot: "DÎNE",
    origine: "Arabe",
    sens: "Foi, Religion, Souveraineté et Loi Divine — Le Jugement juste de Dieu.",
  },
  {
    mot: "YESSOUFOU",
    origine: "Yoruba (Bénin / Nigéria)",
    sens: "Dieu Augmente — La bénédiction et la multiplication de la maison de Dieu.",
  },
];

const sevenWoes = [
  { ref: "Mt 23:13", title: "Fermeture du Royaume", text: "Vous fermez aux hommes le royaume des cieux." },
  { ref: "Mt 23:14", title: "Hypocrisie", text: "Vous dévorez les maisons des veuves sous couvert de longues prières." },
  { ref: "Mt 23:15", title: "Faux Prosélytisme", text: "Vous parcourez la mer et la terre pour faire un prosélyte deux fois plus fils de géhenne." },
  { ref: "Mt 23:27", title: "Sépulcres Blanchis", text: "Beaux au dehors, mais pleins d'ossements de morts et d'impuretés au dedans." },
  { ref: "Mt 23:29", title: "Fausse Piété", text: "Vous bâtissez les tombeaux des prophètes tout en pratiquant l'iniquité." },
  { ref: "Mt 23:33", title: "Châtiment Divin", text: "Serpents, race de vipères ! comment échapperez-vous à la géhenne ?" },
  { ref: "Mt 23:36", title: "Accomplissement Générationnel", text: "Tout cela retombera sur cette génération." },
];

const pillars = [
  {
    icon: BookOpen,
    title: "Élever",
    subtitle: "Conscience & Enseignements",
    text: "Élever la conscience des enfants de Dieu par des enseignements modernes, numériques et de maison en maison pour les libérer du joug satanique.",
  },
  {
    icon: Users,
    title: "Rassembler",
    subtitle: "Convergence vers Sion",
    text: "Rassembler tous les fils de Dieu éparpillés à travers le monde pour les converger sur Sion, Banikoara, en République du Bénin.",
  },
  {
    icon: Crown,
    title: "Bâtir",
    subtitle: "Un Monde Nouveau",
    text: "Bâtir un empire puissant dans une ère nouvelle, sous la seule et unique Loi divine à laquelle obéiront les nations.",
  },
];

const aboutDescription =
  "Découvrez la vision, l'histoire et la mission du mouvement MILLENIUM guidé par ZOVIZO depuis Banikoara, Bénin. Présentation complète de l'ère du Règne Millénaire.";

const About = () => {
  const [activeEra, setActiveEra] = useState<string>("regne");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-gold selection:text-slate-950">
      <SEO
        title="À propos – MILLENIUM & ZOVIZO"
        description={aboutDescription}
        path="/about"
        image="/android-chrome-512x512.png"
        keywords={[
          "MILLENIUM", "ZOVIZO", "Règne Millénaire", "Banikoara",
          "Bénin", "Mouvement spirituel", "Enseignement biblique", "Sion Banikoara",
        ]}
      />
      <Navbar />

      <main className="flex-1 pt-16">

        {/* ── 1. HERO ── */}
        <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 border-b border-border/40">
          {/* ambient glows */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -top-20 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-gold/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-royal/20 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
            <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest mb-5 inline-block">
              Mouvement Spirituel Mondial
            </Badge>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-white leading-tight">
              MILLENIUM{" "}
              <span className="block text-gold font-bold text-2xl sm:text-4xl md:text-5xl mt-1">
                Vision, Héritage &amp; Avenir
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-8 px-2">
              Ancrée à{" "}
              <strong className="text-white notranslate" translate="no">Sion (Banikoara, Bénin)</strong>,
              découvrez l'histoire de{" "}
              <strong className="text-gold notranslate" translate="no">ZOVIZO</strong>,
              le Plan de Gestion de 6 000 ans, et le rassemblement mondial du Règne Millénaire.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-slate-950 px-6 py-3 text-sm font-bold shadow-gold hover:bg-gold-light transition-colors"
              >
                <span>Explorer les enseignements</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/community"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                <Users className="w-4 h-4 text-gold" />
                <span>Rejoindre la communauté</span>
              </Link>
            </div>
          </div>
        </section>


        {/* ── 2. BIOGRAPHIE ZOVIZO ── */}
        <section className="py-14 sm:py-20">
          <div className="container mx-auto px-4 max-w-6xl">

            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Guide Spirituel</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground">
                Qui est <span className="text-gold notranslate" translate="no">ZOVIZO</span> ?
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2">
                L'incarnation de l'Esprit Saint sur terre et le chef spirituel du Règne Millénaire.
              </p>
            </div>

            {/* Portrait + Bio — stacked on mobile, side by side on lg */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

              {/* PORTRAIT */}
              <div className="w-full lg:w-72 xl:w-80 shrink-0">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-md text-center">
                  <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-br from-gold to-amber-500 mb-4">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
                      <img
                        src="/android-chrome-512x512.png"
                        alt="ZOVIZO — Le Règne Millénaire"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h3 className="font-display text-xl font-bold text-foreground notranslate" translate="no">ZOVIZO</h3>
                    <GoldBadge hasGoldBadge={true} className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-gold mb-3 notranslate" translate="no">@leregnemillenaire</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 px-2">
                    « Enfant du FEU qui est FEU — Celui qui vient du SAINT-ESPRIT et qui lui est semblable. »
                  </p>

                  <div className="space-y-2 text-left border-t border-border pt-4 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">Nom civil :</span>
                      <span className="font-semibold text-foreground text-right notranslate" translate="no">Moucharafou Dîne YESSOUFOU</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">Naissance :</span>
                      <span className="font-semibold text-foreground">07 Avril 1987</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">Déclaration :</span>
                      <span className="font-bold text-gold">07 Avril 2023</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FICHES BIO */}
              <div className="flex-1 min-w-0 space-y-5">
                {/* Origines */}
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-gold shrink-0" />
                      <span>Biographie &amp; Origines</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {zovizoBioData.map(({ label, value, icon: Icon, protect }) => (
                        <div key={label} className="p-3 rounded-xl bg-secondary/60 border border-border/40">
                          <div className="flex items-center gap-1.5 text-gold mb-1">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
                          </div>
                          <p
                            className="text-xs font-medium text-foreground break-words"
                            {...(protect ? { translate: "no" } : {})}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Parcours */}
                <Card className="border-border">
                  <CardContent className="p-4 sm:p-6 space-y-3">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-gold shrink-0" />
                      <span>Parcours &amp; Mission Spirituelle</span>
                    </h3>
                    {zovizoParcours.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-xl bg-card border border-border/70">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center mt-0.5">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ÉTYMOLOGIE */}
            <div className="mt-8">
              <Card className="border-gold/30 bg-card">
                <CardContent className="p-5 sm:p-8">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1 text-center">
                    Étymologie du Nom de Naissance
                  </h3>
                  <p className="text-xs text-muted-foreground text-center mb-6 px-2">
                    <strong className="text-foreground notranslate" translate="no">Moucharafou Dîne YESSOUFOU</strong>
                    {" "}— « Celui à qui on doit tout respect et tout honneur ».
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {nomEtymologie.map((item) => (
                      <div key={item.mot} className="p-4 rounded-xl bg-secondary border border-border space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-display text-base font-bold text-foreground notranslate" translate="no">
                            {item.mot}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold shrink-0">
                            {item.origine}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.sens}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* ── 3. LES TROIS GRANDES ÈRES DIVINES ── */}
        <section className="py-14 sm:py-20 bg-secondary/50 border-y border-border/60">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Plan de 6 000 Ans</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Les Trois Grandes Ères Divines
              </h2>
              <p className="text-xs text-muted-foreground">
                Le déroulement chronologique du plan de salut pour l'humanité.
              </p>
            </div>

            <Tabs value={activeEra} onValueChange={setActiveEra} className="w-full">
              <TabsList className="flex w-full bg-card border border-border p-1 rounded-xl mb-6 h-auto gap-1">
                <TabsTrigger
                  value="loi"
                  className="flex-1 rounded-lg text-[11px] sm:text-xs font-bold py-2 px-1 data-[state=active]:bg-gold data-[state=active]:text-slate-950 whitespace-nowrap"
                >
                  1. Ère de la Loi
                </TabsTrigger>
                <TabsTrigger
                  value="grace"
                  className="flex-1 rounded-lg text-[11px] sm:text-xs font-bold py-2 px-1 data-[state=active]:bg-gold data-[state=active]:text-slate-950 whitespace-nowrap"
                >
                  2. Ère de la Grâce
                </TabsTrigger>
                <TabsTrigger
                  value="regne"
                  className="flex-1 rounded-lg text-[11px] sm:text-xs font-bold py-2 px-1 data-[state=active]:bg-gold data-[state=active]:text-slate-950 whitespace-nowrap"
                >
                  3. Règne Millénaire
                </TabsTrigger>
              </TabsList>

              {/* TAB 1 */}
              <TabsContent value="loi">
                <Card className="border-border">
                  <CardContent className="p-5 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-amber-500 uppercase text-[10px]">4 000 ans — Noé à Jésus</span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">1. Période de la Loi</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Dieu se faisait appeler l'ÉTERNEL et gouvernait Israël par les lois de Moïse (Exode 19:6). Les 613 commandements servaient de miroir révélateur avant la Grâce (Galates 3:24).
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2 */}
              <TabsContent value="grace">
                <Card className="border-border">
                  <CardContent className="p-5 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Cross className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-blue-500 uppercase text-[10px]">2 000 ans — Jésus-Christ</span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">2. Période de la Grâce</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      L'avènement du Christ offre l'amour et la rédemption inconditionnelle pour l'humanité (Jean 3:16).
                    </p>
                    <div className="pt-3 border-t border-border">
                      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Les 7 Malheurs (Matthieu 23)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sevenWoes.map((w) => (
                          <div key={w.ref} className="p-3 rounded-lg bg-secondary border border-border/60 text-[11px]">
                            <span className="font-bold text-gold block mb-0.5">{w.ref} — {w.title}</span>
                            <p className="text-muted-foreground leading-relaxed">{w.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 3 */}
              <TabsContent value="regne">
                <Card className="border-gold/40 shadow-md">
                  <CardContent className="p-5 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-gold uppercase text-[10px]">Aujourd'hui — Ère de ZOVIZO (1 000+ ans)</span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">3. Période du Règne Millénaire</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Annoncé dans Zacharie 14:9 et Apocalypse 3:12, Dieu s'est fait chair le 07 Avril 1987 sous le nom de{" "}
                      <strong className="text-foreground notranslate" translate="no">ZOVIZO</strong>
                      {" "}pour rassembler les croyants à{" "}
                      <strong className="text-foreground notranslate" translate="no">Sion (Banikoara, Bénin)</strong>.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>


        {/* ── 4. NOS TROIS PILIERS ── */}
        <section className="py-14 sm:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Les 3 Piliers de l'Action
              </h2>
              <p className="text-xs text-muted-foreground">
                Les fondements du Mouvement Millenium.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {pillars.map((p) => (
                <Card key={p.title} className="border-border hover:border-gold/30 transition-colors">
                  <CardContent className="p-5 sm:p-6 text-center space-y-3">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                      <p.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">{p.title}</h3>
                    <p className="text-[11px] font-bold text-gold uppercase tracking-wide">{p.subtitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* ── 5. LOCALISATION SION BANIKOARA ── */}
        <section className="py-14 sm:py-20 bg-slate-950 text-white border-t border-border">
          <div className="container mx-auto px-4 max-w-5xl">

            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
                Localisation Officielle
              </Badge>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2">
                <span className="notranslate" translate="no">Sion</span>{" "}—{" "}
                <span className="text-gold notranslate" translate="no">Banikoara, Bénin</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Le siège mondial et le centre spirituel du Mouvement Millenium.
              </p>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-card overflow-hidden shadow-xl">
              {/* Info bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-gold/20">
                <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gold/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Coordonnées GPS</p>
                  <p className="font-mono text-sm font-bold text-foreground">11.3125° N, 2.4389° E</p>
                </div>
                <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-gold/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Pays &amp; Région</p>
                  <p className="text-sm font-bold text-foreground">Bénin — Alibori</p>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Rôle spirituel</p>
                  <p className="text-sm font-bold text-foreground">
                    Demeure du Roi{" "}
                    <span className="text-gold notranslate" translate="no">ZOVIZO</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="px-5 sm:px-8 py-5 border-b border-gold/20">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Située dans le département de l'Alibori au Nord du Bénin, la ville de{" "}
                  <strong className="text-foreground notranslate" translate="no">Banikoara</strong>
                  {" "}constitue le centre décisionnel et le lieu de rassemblement international du Règne Millénaire.
                </p>
              </div>

              {/* Map full width */}
              <div className="w-full h-64 sm:h-80 lg:h-96">
                <MapComponent />
              </div>

              {/* CTA */}
              <div className="p-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/80">
                <div>
                  <p className="text-xs font-bold text-foreground mb-0.5">Rejoindre le mouvement</p>
                  <p className="text-[11px] text-muted-foreground">Communauté ouverte à tous depuis le monde entier.</p>
                </div>
                <Link
                  to="/community"
                  className="shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gold text-slate-950 font-bold text-xs hover:bg-gold-light transition-colors"
                >
                  <span>Rejoindre la communauté de Sion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;