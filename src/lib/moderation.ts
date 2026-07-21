/**
 * Moteur d'Analyse NLP / Intentions Sémantiques & Contextuelles Avancé pour MILLENIUM Chat
 * Détecte les insultes directes, attaques indirectes, moqueries, sarcasmes toxiques, 
 * jugements moraux/psychologiques, menaces et incivilités.
 */

export type ModerationResult = {
  blocked: boolean;
  score: number;
  categories: string[];
  reason: string | null;
  severity: "low" | "medium" | "high" | null;
};

// ─── 1. Grammaire d'Intentions Agressives, Sarcastiques & Attaques Indirectes ──
const ADVANCED_INTENT_PATTERNS = [
  // A. Attaques sur la santé mentale & la raison
  { pattern: /ca\s*(ne\s*)?va\s*(pas\s*|plus\s*)?(bien\s*)?(chez|dans\s*ta\s*tete|dans\s*la\s*tete|dans\s*ton\s*cerveau)/i, weight: 70, label: "Attaque sur la santé mentale" },
  { pattern: /(tu\s*es|t\s*es|es\s*tu)\s*(fou|folle|malade|cingle|tare|zinzin|touche|tratra|derange|habillement|perdu|demonte)/i, weight: 70, label: "Remarque désobligeante" },
  { pattern: /(ca\s*)?tourne\s*pas\s*rondo?\s*(chez|dans)/i, weight: 65, label: "Attaque personnelle" },
  { pattern: /t\s*(as|a)\s*un\s*probleme\s*(mental|dans\s*ta\s*tete|psychologique|de\s*cerveau)/i, weight: 70, label: "Jugement psychologique" },
  { pattern: /tu\s*(devrais|vas)\s*(te\s*faire\s*soigner|voir\s*un\s*psy|consulter)/i, weight: 65, label: "Remarque désobligeante" },
  { pattern: /t\s*(as|a)\s*perdu\s*la\s*tete/i, weight: 60, label: "Attaque personnelle" },

  // B. Jugements sur l'intelligence & Mépris d'instruction
  { pattern: /(es\s*tu|tu\s*es|t\s*es)\s*(bete|stupide|idiot|idiote|con|conne|naze|nul|nulle|incapable|incompetent|demeure|gros\s*nul)/i, weight: 65, label: "Invective désobligeante" },
  { pattern: /tu\s*(comprends|piges?|sais)\s*(rien|que\s*dal+e?|pas\s*grand\s*chose)/i, weight: 55, label: "Mépris / Invective" },
  { pattern: /t\s*(as|a)\s*pas\s*de\s*cerveau|sans\s*cerveau|cerveau\s*vide/i, weight: 70, label: "Insulte sur l'intelligence" },
  { pattern: /ferme\s*(ta\s*gueule|ta\s*bouche|la|ton\s*clapet|ton\s*bec|ta\s*trappe)/i, weight: 75, label: "Injonction agressive" },
  { pattern: /(tais|taire)\s*toi/i, weight: 55, label: "Injonction agressive" },
  { pattern: /(casse|va)\s*toi/i, weight: 70, label: "Injonction agressive" },
  { pattern: /degage\s*(d\s*ici)?/i, weight: 65, label: "Rejet agressif" },

  // C. Moqueries, Sarcasmes toxiques & Invectives familières
  { pattern: /n\s*importe\s*quoi\s*(toi|chez\s*toi|ton\s*truc)/i, weight: 50, label: "Propos désobligeants" },
  { pattern: /tu\s*(dis|racontes?)\s*(des\s*conneries|de\s*la\s*merde|des\s*aneries|des\s*salades)/i, weight: 65, label: "Langage vulgaire et irrespectueux" },
  { pattern: /pauvre\s*(type|mec|fille|gars)/i, weight: 65, label: "Invective désobligeante" },
  { pattern: /occupe\s*toi\s*de\s*tes\s*(fesses|oignons|affaires)/i, weight: 55, label: "Remarque agressive" },
  { pattern: /ferme\s*tes\s*fesses/i, weight: 60, label: "Injonction agressive" },
  { pattern: /ferme\s*tes\s*yeux/i, weight: 40, label: "Injonction agressive" },

  // D. Attaques morales & Provocations spirituelles / religieuses
  { pattern: /tu\s*n\s*es\s*pas\s*(chretien|un\s*enfant\s*de\s*dieu|fidele)/i, weight: 60, label: "Jugement spirituel/moral" },
  { pattern: /espece\s*d\s*(hypocrite|imposteur|menteur|voleur|escroc)/i, weight: 70, label: "Accusation/Insulte" },
  { pattern: /(tu\s*es|t\s*es)\s*un\s*(hypocrite|imposteur|menteur|voleur|escroc|faux)/i, weight: 70, label: "Accusation/Insulte" },
  { pattern: /va\s*au\s*diable|enfer\s*pour\s*toi/i, weight: 75, label: "Malediction/Propos agressifs" },
];

// ─── 2. Dictionnaire exhaustif de mots toxiques (Insultes & Vulgarités) ──────
const TOXIC_DICTIONARY: Record<string, number> = {
  // Directes
  "tu es fou": 65, "t es fou": 65, "t'es fou": 65, "es tu fou": 65, "tu es folle": 65,
  "tu es malade": 60, "t es malade": 60, "t'es malade": 60, "cingle": 65, "cinglé": 65, "tare": 65, "taré": 65,
  "tu es bete": 55, "tu es bête": 55, "stupide": 50, "con": 60, "conne": 60, "t'es con": 65, "t'es conne": 65,
  "ta gueule": 75, "tg": 60, "ferme ta gueule": 75, "ferme la": 50, "ferme-la": 50, "tais toi": 50, "dégage": 60,
  "fdp": 85, "fils de pute": 90, "fils de putain": 90, "fils de chien": 80, "ntm": 85,

  // Injures françaises
  "merde": 30, "putain": 30, "bordel": 25, "connard": 65, "connasse": 65, "salope": 75, "salaud": 65,
  "encule": 75, "enculé": 75, "batard": 70, "bâtard": 70, "pute": 75, "salopard": 70, "enfoire": 65, "enfoiré": 65,
  "abruti": 50, "imbecile": 45, "imbécile": 45, "idiot": 40, "idiote": 40, "cretin": 45, "crétin": 45,
  "debile": 50, "débile": 50, "mongol": 65, "attarde": 65, "attardé": 65, "bouffon": 50, "ordure": 55,

  // Haine & Discours racistes
  "singe": 75, "negro": 95, "nègre": 95, "bougnoule": 95, "bicot": 90, "youpin": 95,
  "sale noir": 100, "sale arabe": 100, "sale blanc": 100, "sale juif": 100, "sale gay": 100, "sale homo": 100,
  "race de merde": 100, "retourne dans ton pays": 95, "mort aux": 90,

  // Menaces de violence
  "je vais te tuer": 100, "je te tue": 100, "je vais te crever": 100, "je te creve": 100,
  "je vais te defoncer": 90, "je vais te défoncer": 90, "tue toi": 100,

  // Insultes anglaises
  "fuck": 45, "fucking": 45, "motherfucker": 85, "shit": 35, "asshole": 65, "bastard": 65,
  "bitch": 75, "cunt": 85, "whore": 80, "nigger": 100, "nigga": 90, "faggot": 95, "kys": 95,
  "shut up": 45, "you are crazy": 45, "youre crazy": 45,
};

// ─── 3. Patterns de Spam & Liens Suspects ──────────────────────────────────
const SPAM_PATTERNS = [
  { pattern: /bit\.ly\/\S+/i, score: 65, label: "Lien raccourci suspect" },
  { pattern: /tinyurl\.com\/\S+/i, score: 65, label: "Lien raccourci suspect" },
  { pattern: /t\.me\/\S+/i, score: 55, label: "Invitation Telegram non sollicitée" },
  { pattern: /free\s*(money|crypto|bitcoin|eth|gift)/i, score: 75, label: "Arnaque / Crypto spam" },
  { pattern: /gagner\s*\d+\s*(€|\$|euros?|dollars?)/i, score: 70, label: "Promesse d'argent facile" },
  { pattern: /whatsapp.*\+\d{8,}/i, score: 60, label: "Démarchage WhatsApp" },
];

// ─── Normalisation ultra-poussée ─────────────────────────────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/['’`_-]/g, " ")       // Ponctuation interne -> espace
    .replace(/[^a-z0-9\s]/g, "")    // Symboles -> supprimés
    .replace(/[0@]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Moteur Avancé de Modération NLP / Contextuel
 */
export function moderateMessage(raw: string): ModerationResult {
  if (!raw || raw.trim().length === 0) {
    return { blocked: false, score: 0, categories: [], reason: null, severity: null };
  }

  const text = raw.trim();
  const normText = normalize(text);
  let totalScore = 0;
  const categoriesSet = new Set<string>();

  // 1. Analyse par Grammaire d'Intentions Agressives & Attaques Indirectes
  for (const item of ADVANCED_INTENT_PATTERNS) {
    if (item.pattern.test(normText)) {
      totalScore += item.weight;
      categoriesSet.add(item.label);
    }
  }

  // 2. Analyse par Mots & Expressions du Dictionnaire
  for (const [key, weight] of Object.entries(TOXIC_DICTIONARY)) {
    const normKey = normalize(key);
    if (normText.includes(normKey)) {
      totalScore += weight;
      if (weight >= 85) categoriesSet.add("Propos graves / Haine");
      else if (weight >= 50) categoriesSet.add("Attaques personnelles / Insultes");
      else categoriesSet.add("Langage inapproprié");
    }
  }

  // 3. Détection Spam
  for (const item of SPAM_PATTERNS) {
    if (item.pattern.test(text)) {
      totalScore += item.score;
      categoriesSet.add("Spam / Publicité");
    }
  }

  // 4. Flood (répétitions compulsives)
  if (/(.)\1{8,}/.test(text)) {
    totalScore += 35;
    categoriesSet.add("Répétition abusive (Flood)");
  }

  // 5. Cris en Majuscules
  if (text.length >= 25 && text === text.toUpperCase() && /[A-ZÉÈÀ]{5}/.test(text)) {
    totalScore += 25;
    categoriesSet.add("Cris (Majuscules)");
  }

  // ── Seuil de blocage : Score >= 40 ───────────────────────────────────────
  const isBlocked = totalScore >= 40;
  const categories = Array.from(categoriesSet);

  if (!isBlocked) {
    return { blocked: false, score: totalScore, categories: [], reason: null, severity: null };
  }

  let severity: "low" | "medium" | "high" = "low";
  if (totalScore >= 80) severity = "high";
  else if (totalScore >= 55) severity = "medium";

  let reason = "Votre message a été bloqué par la modération.";
  if (categories.includes("Propos graves / Haine")) {
    reason = "Message bloqué : Discours haineux ou attaques graves non tolérés.";
  } else if (categories.includes("Attaques personnelles / Insultes") || categories.some(c => c.includes("Attaque") || c.includes("Remarque") || c.includes("Invective") || c.includes("Rejet") || c.includes("Jugement") || c.includes("Insulte"))) {
    reason = "Message bloqué : Les attaques personnelles, piques agressives, remarques désobligeantes et jugements moraux sont interdits.";
  } else if (categories.includes("Langage inapproprié")) {
    reason = "Message bloqué : Merci de maintenir un langage respectueux.";
  } else if (categories.includes("Spam / Publicité")) {
    reason = "Message bloqué : Les liens et publicités non autorisés sont interdits.";
  }

  return {
    blocked: true,
    score: totalScore,
    categories,
    reason,
    severity,
  };
}

export function getSeverityStyle(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "high":   return { color: "text-red-500",    bg: "bg-red-500/10 border-red-500/30" };
    case "medium": return { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" };
    case "low":    return { color: "text-amber-500",  bg: "bg-amber-500/10 border-amber-500/30" };
  }
}
