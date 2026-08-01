import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MapComponent from "@/components/MapComponent";
import { Card, CardContent } from "@/components/ui/card";
import {
  Cross,
  Users,
  Globe,
  Heart,
  Sparkles,
  BookOpen,
  Crown,
  Shield,
  Flame,
  Scroll,
  Star,
  AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const sevenWoes = [
  { ref: "Matthieu 23:13", text: "Malheur à vous, scribes et pharisiens hypocrites ! parce que vous fermez aux hommes le royaume des cieux ; vous n'y entrez pas vous-mêmes, et vous n'y laissez pas entrer ceux qui veulent entrer." },
  { ref: "Matthieu 23:14", text: "Malheur à vous, scribes et pharisiens hypocrites ! parce que vous dévorez les maisons des veuves, et que vous faites pour l'apparence de longues prières ; à cause de cela, vous serez jugés plus sévèrement." },
  { ref: "Matthieu 23:15", text: "Malheur à vous, scribes et pharisiens hypocrites ! parce que vous courez la mer et la terre pour faire un prosélyte ; et, quand il l'est devenu, vous en faites un fils de la géhenne deux fois plus que vous." },
  { ref: "Matthieu 23:27-28", text: "Malheur à vous, scribes et pharisiens hypocrites ! parce que vous ressemblez à des sépulcres blanchis, qui paraissent beaux au dehors, et qui, au dedans, sont pleins d'ossements de morts et de toute espèce d'impuretés. Vous de même, au dehors, vous paraissez justes aux hommes, mais, au dedans, vous êtes pleins d'hypocrisie et d'iniquité." },
  { ref: "Matthieu 23:29", text: "Malheur à vous, scribes et pharisiens hypocrites ! parce que vous bâtissez les tombeaux des prophètes et ornez les sépulcres des justes." },
  { ref: "Matthieu 23:33", text: "Serpents, race de vipères ! comment échapperez-vous au châtiment de la géhenne ?" },
  { ref: "Matthieu 23:36", text: "Je vous le dis en vérité, tout cela retombera sur cette génération." },
];

const pillars = [
  {
    icon: Sparkles,
    title: "Élever",
    text: "Élever la conscience des enfants de Dieu choisis, par des enseignements de maison en maison et tout genre d'enseignements médiatiques ou de réseaux sociaux avec des outils de technologie à la pointe, pour les libérer totalement du joug satanique.",
  },
  {
    icon: Users,
    title: "Rassembler",
    text: "Rassembler tous les dignes fils de Dieu éparpillés çà et là, pour les converger sur Sion, Banikoara, en République du Bénin, Afrique de l'Ouest.",
  },
  {
    icon: Crown,
    title: "Bâtir",
    text: "Bâtir un empire puissant dans un monde nouveau, par une nouvelle et seule Loi, à laquelle devront obéir toutes les nations qui se réclament de Sion.",
  },
];

const zovizoBio = [
  { label: "Nom de naissance", value: "Moucharafou Dîne YESSOUFOU" },
  { label: "Date de naissance", value: "07 Avril 1987, à 01h43 — Cotonou, Bénin" },
  { label: "Lieu", value: "Hôpital situé à l'actuelle Radio Planète de Gbégamey" },
  { label: "Nationalité", value: "Béninoise — marié avec enfants" },
  { label: "Mère", value: "KAKPO SEKAN Gisèle, revendeuse à Cotonou, originaire de Guezin Zikpanou (route de Comè)" },
  { label: "Tuteur", value: "FANOUVI LOKOSSOU Codjo Ferdinand, de la collectivité Fanouvi Tossa Djahoun, commune de Bopa, département du Mono" },
  { label: "Fratrie", value: "1er garçon d'une famille de 5 enfants (2 garçons et 3 filles)" },
  { label: "Parcours professionnel", value: "Transit maritime au Port autonome de Cotonou — exportateur de bois vers la Chine (sept. 2010 – juil. 2013) ; expériences en plomberie et ferronnerie à Porto-Novo, Malanville, Tanguiéta, Bohicon…" },
  { label: "Artiste", value: "Compositeur-chanteur — au moins 6 chants composés pour étendre l'œuvre du Règne Millénaire" },
  { label: "Foi initiale", value: "Famille musulmane ; devient ensuite fidèle de l'Église Apostolique du Bénin (EAB) ; baptisé dans plusieurs congrégations pour briser les chaînes sataniques liées au peuple de Dieu" },
  { label: "Révélation officielle", value: "07 Avril 2023 — à l'âge exact de 36 ans, déclaration officielle à la face du monde : « Mon nom est ZOVIZO »" },
  { label: "Signification de ZOVIZO", value: "Enfant du FEU qui est FEU — Celui qui vient du SAINT-ESPRIT et qui lui est semblable" },
];

const nomEtymologie = [
  {
    mot: "MOUCHARAFOU",
    origine: "Arabe",
    sens: "Honorable, Noble — titre de respect pour un leader ou notable, surtout en Afrique de l'Ouest",
  },
  {
    mot: "DÎNE",
    origine: "Arabe",
    sens: "Religion, Foi, Croyance en Dieu — peut aussi signifier Jugement ou Loi",
  },
  {
    mot: "YESSOUFOU",
    origine: "Yoruba (Bénin / Nigéria)",
    sens: "Dieu Augmente — signifie que Dieu a augmenté la famille et apporté une bénédiction",
  },
];


/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

const aboutDescription =
  "Découvrez l'histoire, la vision et la mission de MILLENIUM, le mouvement religieux né à Banikoara, Bénin, guidé par ZOVIZO pour rassembler, élever et bâtir un règne millénaire mondial.";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="À propos – MILLENIUM"
        description={aboutDescription}
        path="/about"
        image="/android-chrome-512x512.png"
        keywords={[
          "MILLENIUM",
          "Règne Millénaire",
          "Banikoara",
          "ZOVIZO",
          "Bénin",
          "communauté spirituelle",
          "vision chrétienne",
          "mission mondiale",
        ]}
      />
      <Navbar />
      <main className="flex-1 pt-16">

        {/* HERO */}
        <section className="relative overflow-hidden bg-about-hero text-primary-foreground py-20 md:py-24">
          <img
            src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1800&q=85"
            alt="Famille africaine réunie dans un moment de partage"
            loading="eager"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 z-0 bg-slate-950/35" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-blob-slow" />
            <div className="absolute right-[-5%] top-28 h-64 w-64 rounded-full bg-gold/20 blur-3xl animate-blob-slow" />
            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/10 blur-3xl animate-blob-slow" />
            <div className="absolute inset-0 bg-hero-grid opacity-15" />
          </div>
          <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
            <Crown className="w-16 h-16 mx-auto text-gold mb-6" />
            <span className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-gold mb-4">
              À propos du Millenium
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-white">
              Le mouvement Millenium <br /> entre vision, héritage et avenir
            </h1>
            <p className="mx-auto max-w-3xl text-lg md:text-xl text-white/85 font-body leading-relaxed mb-8">
              Un récit spirituel ancré à Banikoara, révélant la mission de ZOVIZO, la structure des trois périodes divines,
              et l'appel à rassembler une communauté mondiale autour du Royaume millénaire.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/feed"
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-gold/20 transition hover:shadow-xl"
              >
                Explorer les enseignements
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Rejoindre la communauté
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4 max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Vision",
                text: "Rassembler et élever les enfants de Dieu vers un règne millénaire de paix.",
                icon: Globe,
              },
              {
                title: "Mission",
                text: "Proposer des enseignements, un guide spirituel et une communauté unie.",
                icon: Sparkles,
              },
              {
                title: "Impact",
                text: "Faire de Banikoara le cœur spirituel d'une nouvelle ère mondiale.",
                icon: Users,
              },
            ].map((item) => (
              <Card key={item.title} className="border-gold/20">
                <CardContent className="p-8">
                  <div className="mb-4 h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* INTRODUCTION GÉNÉRALE */}
        <section className="py-20 container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Scroll className="w-8 h-8 text-gold" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Introduction générale
            </h2>
          </div>
          <h3 className="font-display text-2xl font-semibold text-midnight text-center mb-10">
            La puissance de la Parole
          </h3>

          <div className="space-y-5 text-foreground/85 font-body leading-relaxed">
            <p>
              À l'origine de toute chose, Dieu créa les cieux et la terre par la Parole, et c'est par
              Elle que tout a été créé.{" "}
              <em className="text-midnight font-semibold">Genèse 1:1 — « Au commencement, Dieu créa les cieux et la terre. »</em>{" "}
              <em className="text-midnight font-semibold">Jean 1:3 — « Toutes choses ont été faites par elle, et rien de ce qui a été fait n'a été sans elle. »</em>
            </p>
            <p>
              Le livre de la Genèse et tant d'autres nous ont instruits à propos de la création de l'homme
              à l'image de Dieu. Dans <strong>Genèse 1:26-27</strong>, l'accent y est mis particulièrement :{" "}
              <em>« Puis Dieu dit : Faisons l'homme à notre image, selon notre ressemblance, et qu'il
              domine sur les poissons de la mer, sur les oiseaux du ciel, sur le bétail, sur toute la
              terre et sur tous les reptiles qui rampent sur la terre. Dieu créa l'homme à Son image,
              Il créa l'homme et la femme. »</em>{" "}
              Toute l'historique de l'homme débute ainsi et continue de se dérouler sous nos yeux.
            </p>

            <div className="border-l-4 border-gold/40 pl-5 py-2 mt-6">
              <h4 className="font-display text-lg font-bold text-foreground mb-3">I. Légende et généalogie</h4>
              <p className="text-midnight font-semibold text-sm italic mb-4">
                De Noé jusqu'à Abraham : 2 000 ans — d'Abraham jusqu'à la naissance de Jésus : 2 000 ans — de Jésus jusqu'à aujourd'hui : 2 000 ans.
              </p>
            </div>

            <p>
              <strong>Lucifer</strong>, le premier ange de Dieu, ayant presque tout de semblable à Dieu
              Lui-même et possédant presque les mêmes connaissances que Lui, le trahit. Cette trahison a
              pour conséquence sa chute :{" "}
              <em className="text-midnight font-semibold">Ésaïe 14:12-15 — « Te voilà tomber du ciel, astre brillant, fils de l'aurore ! Tu
              disais en ton cœur : je monterai au ciel, et j'élèverai mon trône au-dessus des étoiles de
              Dieu. Mais tu as été précipité dans le séjour des morts. »</em>
            </p>
            <p>
              Il entraîne le tiers des anges et vient sur terre :{" "}
              <em className="text-midnight font-semibold">Apocalypse 12:7-9, 12 — « Et il y eut guerre dans le ciel. Michel et ses anges
              combattirent contre le grand dragon, le serpent ancien, appelé le diable et satan, celui qui
              séduit toute la terre ; il fut précipité sur la terre et ses anges furent précipités avec
              lui. Malheur à la terre et à la mer ! Car le diable est descendu vers vous, animé d'une
              grande colère. »</em>{" "}
              Sa chute affecte le ciel puis la terre. L'univers entier entre en guerre spirituelle, la
              création toute entière est assujettie à la corruption et maudite.
            </p>
            <p>
              La séduction d'Adam et Ève par Satan provoque la chute de l'homme, caractérisée par
              l'entrée du péché et de la mort (Genèse 3:1-6). Le jugement de Dieu s'abat alors sur toute
              la création (Genèse 3:14-19) :
            </p>
          </div>

          {/* Les 3 jugements */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              {
                titre: "Sur le serpent / Satan",
                ref: "Genèse 3:14-15",
                texte: "« Puisque tu as fait cela, tu seras maudit. Je mettrai l'inimitié entre toi et la femme, entre ta postérité et sa postérité : celle-ci t'écrasera la tête et tu lui blesseras le talon. »",
              },
              {
                titre: "Sur la femme",
                ref: "Genèse 3:16",
                texte: "« J'augmenterai la souffrance de tes grossesses, tu enfanteras avec douleur, et tes désirs se porteront vers ton mari et il dominera sur toi. »",
              },
              {
                titre: "Sur l'homme et la création",
                ref: "Genèse 3:17-19",
                texte: "« Le sol sera maudit à cause de toi. C'est à force de peine que tu en tireras ta nourriture. Il te produira des ronces et des épines. Car tu es poussière et tu retourneras dans la poussière. »",
              },
            ].map((j) => (
              <Card key={j.titre} className="border-gold/20">
                <CardContent className="p-5">
                  <p className="font-display text-sm font-bold text-foreground mb-1">{j.titre}</p>
                  <p className="text-midnight font-semibold text-xs font-body mb-3">{j.ref}</p>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed italic">{j.texte}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 space-y-5 text-foreground/85 font-body leading-relaxed">
            <p>
              Lucifer, jadis ange de lumière, tomba par orgueil et devint <strong>Béelzébul</strong>,
              c'est-à-dire « roi des ténèbres ». Tout en lui est désormais tout le contraire de Dieu.
              Pourtant, dans Genèse 3:23-24, Dieu démontra sa grâce au milieu du jugement :{" "}
              <em className="text-midnight font-semibold">« L'Éternel Dieu fit à Adam et à sa femme des habits de peau, et Il les en revêtit. Il chassa Adam ; et il mit à l'orient du jardin d'Éden les chérubins pour garder le chemin de l'arbre de vie. »</em>
            </p>
            <p>
              Dieu annonça par la suite son plan de gestion pour sauver et récupérer Sa chère créature,
              pendant que l'ange déchu continuait à faire tout ce qu'il pouvait pour que l'homme soit à
              jamais perdu. Satan a continué d'influencer l'univers-monde par sa corruption jusqu'à nos jours.
            </p>
            <p>
              Il est à noter que ce récit de la création rapporté par la Bible est purement écrit en{" "}
              <strong>parabole</strong>, c'est-à-dire en langage de l'Esprit. Pour nous éclairer sur la
              vérité, <strong>ZOVIZO Lui-Même</strong> nous a fait savoir les réelles explications dans
              un langage humain. La vérité sur la création selon les Paroles de ZOVIZO sera révélée par
              la suite.
            </p>
            <p>
              Ainsi, Dieu établit l'ensemble de Son{" "}
              <strong>Plan de Gestion de six mille (6 000) ans</strong> en trois périodes ou ères pour
              sauver, purifier et restaurer définitivement l'univers tout entier — notamment l'Homme —
              sous l'emprise satanique, afin de le reconquérir. Ces trois périodes sont :{" "}
              <strong>Période de la Loi, Période de la Grâce et Période du Règne Millénaire.</strong>
            </p>
          </div>
        </section>

        {/* LES TROIS GRANDES PÉRIODES */}
        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              II. Les trois grandes périodes divines
            </h2>
            <p className="text-center text-muted-foreground font-body mb-14 max-w-2xl mx-auto">
              Le Plan de Gestion de 6 000 ans de Dieu pour l'humanité s'articule en trois ères successives,
              chacune incarnée par un gestionnaire désigné.
            </p>

            {/* A — Période de la Loi */}
            <div className="mb-10">
              <Card className="border-amber-700/30">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-amber-800/30 flex items-center justify-center shrink-0">
                      <Shield className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-body uppercase tracking-widest">Première ère</p>
                      <h3 className="font-display text-2xl font-bold text-foreground">A. Période de la Loi</h3>
                      <p className="text-muted-foreground text-sm font-body">De Noé à Jésus — 4 000 ans</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-foreground/85 font-body leading-relaxed text-sm">
                    <p>
                      C'est la période où Dieu se faisait appeler l'<strong>ÉTERNEL</strong> et gouvernait
                      son peuple Israël par la loi de Moïse, depuis le Mont Sinaï jusqu'à la venue du
                      Christ.{" "}
                      <em className="text-midnight font-semibold">Exode 19:6 — « Vous serez pour moi un royaume de sacrificateurs et une nation sainte. »</em>{" "}
                      <em className="text-midnight font-semibold">Exode 20:2 — « Je suis l'Éternel ton Dieu qui t'a fait sortir du pays d'Égypte, de la maison de la servitude. »</em>
                    </p>
                    <p>
                      Dieu donna la loi pour conduire son peuple de l'Égypte jusqu'à la terre promise.
                      D'autres prophètes étaient aussi au service de Dieu comme Moïse : Ésaïe, Josué,
                      Éli, Néhémie… (Néhémie 9:9-15, 25). L'ensemble des prescriptions se regroupent
                      à travers les dix commandements, les lois civiles et les lois cérémonielles —
                      au total, la tradition juive compte <strong>613 commandements</strong>.
                    </p>
                    <p>
                      Ainsi la loi a été comme un pédagogue pour conduire à Christ :{" "}
                      <em className="text-midnight font-semibold">Galates 3:24 — « La loi a été comme un pédagogue afin que nous fussions justifiés par la foi. »</em>{" "}
                      La loi est un miroir : elle révèle que « tu es sale, mais ne te lave pas ».
                      L'ère de la loi était nécessaire mais temporaire. Elle était le tuteur en attendant
                      le Fils. À la fin de cette période, Dieu inaugura une nouvelle ère, celle de la Grâce.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* B — Période de la Grâce */}
            <div className="mb-10">
              <Card className="border-blue-700/30">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-800/30 flex items-center justify-center shrink-0">
                      <Cross className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-blue-400 text-xs font-body uppercase tracking-widest">Deuxième ère</p>
                      <h3 className="font-display text-2xl font-bold text-foreground">B. Période de la Grâce ou de la Rédemption</h3>
                      <p className="text-muted-foreground text-sm font-body">L'ère de Jésus-Christ — 2 000 ans</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-foreground/85 font-body leading-relaxed text-sm">
                    <p>
                      L'avènement du Christ inaugure une nouvelle ère qu'est la Grâce et achève l'ancienne
                      qui est la Loi. Cette première prise de chair de l'Esprit de Dieu qui est{" "}
                      <strong>JÉSUS</strong> s'est manifestée en Judée et son œuvre s'est répandue sur la
                      terre entière.
                    </p>

                    <div className="bg-foreground/5 rounded-lg p-5">
                      <p className="font-display text-base font-bold text-foreground mb-4">Qui est Jésus ?</p>
                      <ul className="space-y-3">
                        <li className="flex gap-2 text-sm">
                          <Star className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span><strong>ÉTERNEL</strong> — « Au commencement était la Parole… la Parole était Dieu » (Jean 1:1) ; existe avant Abraham (Jean 8:58).</span>
                        </li>
                        <li className="flex gap-2 text-sm">
                          <Star className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span><strong>FILS DE DIEU</strong> — « Celui-ci est mon fils bien-aimé » (Matthieu 3:17).</span>
                        </li>
                        <li className="flex gap-2 text-sm">
                          <Star className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span><strong>DIEU FAIT HOMME</strong> — « La Parole a été faite chair » (Jean 1:1) — 100% Dieu, 100% homme (Colossiens 2:9 — « Car en lui habite corporellement toute la plénitude de la divinité »).</span>
                        </li>
                      </ul>
                    </div>

                    <p>
                      Jésus-Christ représente l'œuvre de cette ère. Il a été appelé{" "}
                      <em>LE CHEF SUPRÊME</em>, <em>LE RÉDEMPTEUR</em> et <em>LE SACRIFICE D'EXPIATION</em> :{" "}
                      <em className="text-midnight font-semibold">Matthieu 20:28 — « Le Fils de l'homme est venu non pas pour être servi mais pour servir et donner sa vie comme rançon pour plusieurs. »</em>{" "}
                      <em className="text-midnight font-semibold">Jean 3:16 — « Dieu a tant aimé le monde qu'Il a donné Son Fils unique, afin que quiconque croit en Lui ne périsse point, mais qu'il ait la vie éternelle. »</em>
                    </p>
                    <p>
                      Cet amour est décrit comme un amour altruiste et inconditionnel, qui ne dépend pas
                      des mérites ou de la valeur des humains, mais simplement de la nature de Dieu
                      lui-même. Dieu a inauguré l'œuvre de la Rédemption en se livrant pour nos fautes
                      et en ressuscitant pour notre justification (Matthieu 27:46-51).
                    </p>
                    <p>
                      En réalité, tout le travail que Notre Seigneur Jésus a fait (3 ans et demi) a été
                      hors de la synagogue. Il avait été partout. Jésus réservait ses paroles les plus
                      dures non aux prostituées ni aux collecteurs d'impôts (Luc 7:36-50), mais aux
                      pharisiens qui se croyaient justes (Matthieu 23:1-36) — d'où les{" "}
                      <strong>7 malheurs</strong> :
                    </p>

                    {/* Les 7 malheurs */}
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-gold" />
                        <p className="font-display text-base font-bold text-foreground">Les 7 malheurs</p>
                      </div>
                      <div className="space-y-3">
                        {sevenWoes.map((w) => (
                          <div key={w.ref} className="border-l-2 border-gold/30 pl-4">
                            <p className="text-midnight text-xs font-body mb-1 font-semibold">{w.ref}</p>
                            <p className="text-foreground/75 font-body text-xs leading-relaxed italic">{w.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="mt-4">
                      C'est également au cours de cette période que Jésus annonça le Royaume de Dieu :{" "}
                      <em className="text-midnight font-semibold">Matthieu 26:29 — « Je ne boirai plus désormais de ce fruit de la vigne, jusqu'au jour où j'en boirai du nouveau avec vous dans le royaume de mon Père. »</em>{" "}
                      Nous comprenons ainsi que Jésus-Christ reviendra dans les derniers jours sur la
                      terre en tant que Roi — car on ne saurait boire du vin dans les cieux — ce qui
                      justifie pleinement l'arrivée du Roi ZOVIZO et la justification de ses messages.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* C — Période du Règne Millénaire */}
            <div>
              <Card className="border-gold/50 shadow-royal ring-1 ring-gold/20">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                      <Crown className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-body uppercase tracking-widest">Troisième ère — Aujourd'hui</p>
                      <h3 className="font-display text-2xl font-bold text-foreground">C. Période du Règne Millénaire</h3>
                      <p className="text-muted-foreground text-sm font-body">L'ère de ZOVIZO — Plus de 1 000 ans</p>
                    </div>
                  </div>
                  <div className="space-y-6 text-foreground/85 font-body leading-relaxed text-sm">

                    <div>
                      <p className="font-display text-base font-semibold text-foreground mb-3">1. Annonces prophétiques</p>
                      <blockquote className="border-l-2 border-gold/50 pl-4 text-midnight font-semibold italic text-sm mb-4">
                        Zacharie 14:9, 16-17 — « L'Éternel sera roi de toute la terre ; en ce jour-là,
                        l'Éternel sera le seul Éternel et son nom sera le seul nom. Tous ceux qui
                        resteront de toutes les nations rentreront chaque année pour se prosterner devant
                        le Roi, l'Éternel des armées. »
                      </blockquote>
                      <p>
                        Cette période du Règne a débuté officieusement par la naissance d'une chair
                        masculine que Dieu Lui-même est devenu le <strong>07 Avril 1987</strong> — événement
                        mystérieux survenu au Bénin. Deux ans après sa naissance, en 1989, Il répand son
                        Esprit sur toute chair, conformément à{" "}
                        <em className="text-midnight font-semibold">Actes 2:17-18 — « Dans les derniers jours, dit Dieu, je répandrai mon Esprit sur toute chair ; vos fils et vos filles prophétiseront, vos jeunes gens auront des visions, et vos vieillards auront des songes. Oui, sur mes serviteurs et sur mes servantes, dans ces jours-là, je répandrai mon Esprit ; et ils prophétiseront. »</em>
                      </p>
                      <p className="mt-3">
                        Pour réaliser l'œuvre du Règne Millénaire, l'Esprit s'est fait chair pour venir
                        régner au milieu des hommes. Toutes les promesses faites par le Seigneur
                        Jésus-Christ avant son ascension, Celui-ci est revenu maintenant sous l'appellation
                        de <strong>ZOVIZO</strong> pour les accomplir.{" "}
                        <em className="text-midnight font-semibold">Matthieu 16:27 — « Car le Fils de l'homme doit venir dans la gloire de son Père avec ses anges, et alors il rendra à chacun selon ses œuvres. »</em>{" "}
                        C'est donc le même Esprit qui opère depuis la création qui continue de s'opérer en
                        ZOVIZO aujourd'hui.
                      </p>
                      <p className="mt-3">
                        Selon{" "}
                        <em className="text-midnight font-semibold">Matthieu 24:37-39 — « Ce qui arriva du temps de Noé arrivera de même à l'avènement du Fils de l'homme ; ils ne se doutèrent de rien jusqu'à ce que le déluge vînt ; il en sera de même à l'avènement du Fils de l'homme. »</em>
                      </p>
                      <p className="mt-3">
                        Tout comme ce qui s'était passé au temps de Noé, ainsi{" "}
                        <strong>Sion (Banikoara, Bénin)</strong> est aujourd'hui un refuge — l'arche — pour
                        les véritables enfants de Dieu éparpillés dans toute l'humanité. Dieu déversera sa
                        colère dans l'univers tout entier pour punir le mal depuis sa source et tout restaurer.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gold/20">
                      <p className="font-display text-base font-semibold text-foreground mb-3">2. Désignation du gestionnaire de période : ZOVIZO</p>
                      <p>
                        Par conséquent, Dieu lui-même s'est fait homme et vient pour continuer et achever
                        ses plans de gestion de 6 000 ans — afin de purifier et de restaurer l'humanité
                        sous un Nom nouveau appelé <strong>ZOVIZO</strong>.
                      </p>
                      <blockquote className="border-l-2 border-gold/50 pl-4 text-midnight font-semibold italic text-sm mt-4">
                        Apocalypse 3:12 — « Celui qui vaincra, je ferai de lui une colonne dans le temple
                        de mon Dieu, et il n'en sortira plus ; j'écrirai sur lui le nom de mon Dieu, et le
                        nom de la ville de mon Dieu, de la nouvelle Jérusalem qui descend du ciel d'auprès
                        de mon Dieu, et mon nom nouveau. »
                      </blockquote>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* PRÉSENTATION DU MILLENIUM */}
        <section className="py-20 container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <BookOpen className="w-10 h-10 mx-auto text-gold mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Présentation du <span className="text-foreground">Millenium</span>
            </h2>
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">I. Historique</h3>
          </div>
          <div className="space-y-5 text-foreground/85 font-body leading-relaxed mb-12">
            <p>
              Conduit par un jeune Béninois, annoncé par moult prophètes depuis 6 000 ans, le Millenium
              se veut une période d'accomplissement de toutes les prophéties de Dieu Tout-Puissant,
              Créateur de toutes choses — et de la fusion des 7 cieux créés par ce dernier en un seul,
              qui est notre Terre Planète, où il s'est fait chair depuis le{" "}
              <strong>07 Avril 1987</strong> à travers ce Béninois, qui désormais porte le nom
              d'incarnation : <strong>ZOVIZO</strong> — pour régner en toute gloire pendant plus de{" "}
              <strong>1 000 ans</strong> et pour réaliser toutes choses naguère faites par l'Esprit.
            </p>
            <p>
              De vision fédératrice, le Règne Millénium et son guide ZOVIZO affichent une mission
              d'enlèvement et de rassemblement de tous les peuples dignes du Dieu Créateur du ciel et de
              la terre, dispersés sur cette planète, pour les converger sur un seul lieu en République du
              Bénin — à savoir la ville de <strong>Banikoara</strong> qui devient ainsi{" "}
              <strong>Sion</strong> — non seulement demeure du Roi des Rois ZOVIZO, le seul Roi de tous
              les temps, mais aussi siège social du Millenium.
            </p>
          </div>

          <h4 className="font-display text-xl font-bold text-foreground mb-6 text-center">
            Les œuvres du Millenium reposent sur une triple mission
          </h4>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {pillars.map((p) => (
              <Card key={p.title} className="border-gold/20 hover:shadow-royal transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-gold flex items-center justify-center">
                    <p.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{p.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">{p.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* QUI EST ZOVIZO */}
        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <Flame className="w-12 h-12 mx-auto text-gold mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                II. Qui est <span className="text-foreground">ZOVIZO</span> ?
              </h2>
              <p className="text-muted-foreground font-body">
                Le Roi des Rois et Guide de la révolution du Millenium
              </p>
            </div>

            <Card className="border-gold/30 shadow-royal mb-8">
              <CardContent className="p-8 md:p-10">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Sa biographie</h3>
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
                  {zovizoBio.map(({ label, value }) => (
                    <div key={label} className="border-b border-gold/10 pb-4">
                      <p className="text-xs text-midnight font-semibold font-body uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-foreground font-body text-sm leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/30 mb-8">
              <CardContent className="p-8 md:p-10">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Étymologie du nom de naissance
                </h3>
                <p className="text-muted-foreground text-sm font-body mb-6">
                  Moucharafou Dîne YESSOUFOU — celui à qui on doit tout respect, celui à qui appartient tout honneur.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {nomEtymologie.map((n) => (
                    <div key={n.mot} className="bg-foreground/5 rounded-lg p-5">
                      <p className="font-display text-lg font-bold text-foreground mb-1">{n.mot}</p>
                      <p className="text-xs text-muted-foreground font-body mb-3">Origine : {n.origine}</p>
                      <p className="text-foreground/80 font-body text-sm leading-relaxed">{n.sens}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/50 bg-gradient-to-br from-yellow-950/20 to-transparent">
              <CardContent className="p-8 md:p-10 text-center">
                <Flame className="w-10 h-10 mx-auto text-gold mb-4" />
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  ZOVIZO signifie :
                </h3>
                <p className="text-foreground font-display text-xl font-bold mb-3">
                  Enfant du FEU qui est FEU
                </p>
                <p className="text-foreground/85 font-body text-base leading-relaxed max-w-xl mx-auto">
                  Autrement dit :{" "}
                  <em>Celui qui vient du SAINT-ESPRIT et qui lui est semblable.</em>
                </p>
                <p className="text-muted-foreground font-body text-sm mt-5 max-w-2xl mx-auto">
                  Notons que ZOVIZO a été baptisé au niveau de plusieurs congrégations religieuses —
                  non pas par plaisir ni par hasard — mais pour un objectif bien précis : briser les
                  chaînes sataniques qui lient tout le peuple de Dieu pour pouvoir les sortir de ces emprises.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SION BANIKOARA - CARTE */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Globe className="w-12 h-12 mx-auto text-gold mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Sion — <span className="text-midnight font-semibold">Banikoara, Bénin</span>
              </h2>
              <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
                Le cœur spirituel du Règne Millénaire, d'où rayonne l'enseignement divin vers tous les continents.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-royal overflow-hidden">
              <MapComponent />
            </div>
          </div>
        </section>

        {/* PRÉSENCE MONDIALE */}
        <section className="bg-gradient-hero text-white py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <Globe className="w-12 h-12 mx-auto text-gold mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-white">
              Une présence sur tous les continents
            </h2>
            <p className="text-lg text-white/85 font-body leading-relaxed mb-8">
              Aujourd'hui, des milliers de membres vivent l'œuvre du Règne Millénaire en Afrique,
              en Europe, en Amérique du Nord, dans les Caraïbes et au-delà. Cette plateforme est
              le pont qui les relie tous — convergés vers Sion, Banikoara, Bénin.
            </p>
            <Heart className="w-8 h-8 mx-auto text-gold mb-8" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Rejoindre la communauté
              </Link>
              <Link
                to="/feed"
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-gold/20 transition hover:shadow-xl"
              >
                Voir les enseignements
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default About;