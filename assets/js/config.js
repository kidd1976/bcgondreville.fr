/* ═══════════════════════════════════════════════════════════
   BCG — Configuration centrale
   Un seul fichier à modifier pour brancher le backend.
   ═══════════════════════════════════════════════════════════ */

const BCG = {

  /* ── Backend OVH ────────────────────────────────────────
     Passer MODE à "api" quand api.bcgondreville.fr sera en ligne.
     En "local", le site affiche les données de secours ci-dessous
     et reste 100 % fonctionnel sans backend.                */
  MODE: "local",              // "local" | "api"
  API:  "https://api.bcgondreville.fr",

  /* ── Scorenco (résultats et calendrier) ─────────────────
     Identifiants réels du club, vérifiés le 09/07/2026.
     Les widgets (code d'intégration à coller dans la zone
     #scorenco-embed) se créent depuis le compte club :
     app.scorenco.com → Widgets.                            */
  SCORENCO: {
    id:   135533,
    slug: "basket-club-gondreville-2wkt",
    page: "https://scorenco.com/basket/clubs/basket-club-gondreville-2wkt",
    admin: "https://app.scorenco.com/clubs/135533",

    /* Pages publiques par équipe (saison 2025-26) —
       utiles pour créer un widget ciblé par équipe. */
    equipes: {
      seniorsM1: "1-3iyj",
      seniorsF1: "1-feminine-5eup",
      u18M1:     "1-u18-c82f",
      u15M1:     "1-u15-3ixm",
      u13M1:     "u13-1-4pq5",
      u11M1:     "1-u11-3q58",
      u9M1:      "1-u9-3wd8",
      u9M2:      "u9-2-vd6x",
    },
  },

  /* ── HelloAsso ───────────────────────────────────────────
     Le Client ID est public. Le Client Secret reste côté serveur. */
  HELLOASSO: {
    slug:     "basket-club-gondreville",
    clientId: "d3b7891f22a24358aa5f1d5a494bd704",
    base:     "https://www.helloasso.com/associations/basket-club-gondreville",
  },

  /* ── Réseaux sociaux ────────────────────────────────────
     La synchronisation Instagram → Facebook est un réglage natif
     de Meta, activé dans les paramètres Instagram du club.   */
  SOCIAL: {
    facebook:  "https://www.facebook.com/BasketClubGondreville/",
    instagram: "https://www.instagram.com/basketclubgondreville/",
  },

  /* ── Espace adhérent (BCG Manager) ───────────────────────*/
  INTRANET: "https://app.bcgondreville.fr",

  /* ── Contact ─────────────────────────────────────────────*/
  CONTACT: {
    email:   "contact@bcgondreville.fr",
    tel:     "06 22 70 89 13",
    adresse: "Salle polyvalente, 29 rue du Gué, 54840 Gondreville",
    siret:   "495 057 259 00014",
    ffbb:    "GES0054021",
  },
};

/* ═══════════════════════════════════════════════════════════
   Données de secours — utilisées tant que MODE = "local".
   Une fois le backend en ligne, ces tableaux ne servent plus
   que de repli si l'API ne répond pas.
   ═══════════════════════════════════════════════════════════ */

BCG.FALLBACK = {

  /* Les montants ne sont jamais exposés sur le site public. */
  partenaires: [
    { nom:"Mairie de Gondreville",   formule:"Premium", type:"Mécénat",    web:"" },
    { nom:"Vathelot BTP",            formule:"Platine", type:"Sponsoring", web:"" },
    { nom:"Pièces Auto Gondreville", formule:"Or",      type:"Sponsoring", web:"" },
    { nom:"Barberi Restauration",    formule:"Argent",  type:"Sponsoring", web:"" },
  ],

  equipes: [
    { cat:"U7",        libelle:"Baby Basket",       age:"5–6 ans",   jour:"Mercredi 14h00" },
    { cat:"U9",        libelle:"Mini-poussins",     age:"7–8 ans",   jour:"Mercredi 15h00" },
    { cat:"U11",       libelle:"Poussins",          age:"9–10 ans",  jour:"Mercredi 16h30" },
    { cat:"U13",       libelle:"Benjamins",         age:"11–12 ans", jour:"Mardi 18h00" },
    { cat:"U15",       libelle:"Minimes",           age:"13–14 ans", jour:"Jeudi 18h30" },
    { cat:"U18",       libelle:"Cadets",            age:"15–17 ans", jour:"Vendredi 19h00" },
    { cat:"Seniors M", libelle:"Seniors Masculins", age:"18 ans +",  jour:"Mardi 20h30" },
    { cat:"Seniors F", libelle:"Seniors Féminines", age:"18 ans +",  jour:"Jeudi 20h30" },
  ],
};

/* ═════════════════════════════════════════════════════════
   Récupération de données — bascule automatique API / local
   ═════════════════════════════════════════════════════════ */

BCG.charger = async function (ressource) {
  if (BCG.MODE === "local") return BCG.FALLBACK[ressource] || [];

  try {
    const reponse = await fetch(`${BCG.API}/${ressource}`, {
      headers: { Accept: "application/json" },
    });
    if (!reponse.ok) throw new Error(reponse.status);
    return await reponse.json();
  } catch (e) {
    console.warn(`API indisponible pour « ${ressource} » — affichage des données locales.`);
    return BCG.FALLBACK[ressource] || [];
  }
};
