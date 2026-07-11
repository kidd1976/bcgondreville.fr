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

/* ════════════════════════════════════════════════════════════
   Données de secours — utilisées tant que MODE = "local".
   Une fois le backend en ligne, ces tableaux ne servent plus
   que de repli si l'API ne répond pas.
   ═══════════════════════════════════════════════════════════ */

BCG.FALLBACK = {

  /* Aucun montant n'est exposé sur le site public. */
  partenaires: [
    { nom:"Ville de Gondreville",  lieu:"Gondreville",
      web:"https://www.commune-gondreville.fr/",
      logo:"https://files.appli-intramuros.com/city_logo/agglo/174/66edb0cec9ed7d8769a0111235f72359_Gondrevill.png" },
    { nom:"Entreprise Barberi",    lieu:"Bois-de-Haye",
      web:"https://eurlbarberi.fr/",
      logo:"https://eurlbarberi.fr/wp-content/uploads/2022/10/Logo-Entreprise-Barberi.png" },
    { nom:"Carrefour Contact",     lieu:"Gondreville",
      web:"https://www.carrefour.fr/magasin/contact-gondreville",
      logo:"/assets/img/partenaire-carrefour-contact.svg" },
    { nom:"Optical Center",        lieu:"Dommartin-lès-Toul · Laxou",
      web:"https://opticien.optical-center.fr/234-opticien-dommartin-les-toul-optical-center",
      logo:"" },
    { nom:"Vathelot SARL",         lieu:"Villey-Saint-Étienne · Électricité, plâtrerie, isolation",
      web:"https://annuaire-entreprises.data.gouv.fr/entreprise/vathelot-sarl-522324300",
      logo:"" },
    { nom:"Devisu",                lieu:"Gondreville · Impression grand format",
      web:"https://www.devisu.eu/",
      logo:"/assets/img/partenaire-devisu.svg" },
  ],

  equipes: [
    { cat:"U7",        libelle:"Baby basket",       type:"Mixte",   annees:"2021-2022",      horaires:"Samedi 12h00 – 13h00", coachs:"Clémence, Faustine" },
    { cat:"Mini",      libelle:"Mini basket (U9 – U11)", type:"Mixte", annees:"U9 : 2018-2019 · U11 : 2016-2017", horaires:"Mercredi & Vendredi · détail dans le tableau ci-dessous", coachs:"Laetitia, Mathis, Nicolas B., Stéphane" },
    { cat:"U13",       libelle:"Benjamins",         type:"Mixte",   annees:"2014-2015",      horaires:"Mercredi 17h30–19h00 · Vendredi 19h30–21h00", coachs:"Ophélie, Sophie, Mathis" },
    { cat:"U15",       libelle:"Minimes garçons",   type:"Équipe en cours de construction", annees:"2012-2013", horaires:"", coachs:"" },
    { cat:"U15",       libelle:"Minimes filles",    type:"Équipe en cours de construction", annees:"2012-2013", horaires:"", coachs:"" },
    { cat:"U18",       libelle:"Cadets",            type:"Garçons", annees:"2009-2010-2011", horaires:"Lundi 19h00–20h30 · Mercredi 19h00–20h30", coachs:"Mathis, Matthieu" },
    { cat:"U18",       libelle:"Cadettes",          type:"Équipe en cours de construction", annees:"2009-2010-2011", horaires:"", coachs:"" },
    { cat:"Seniors M", libelle:"Seniors masculins", type:"",        annees:"2008 et avant",  horaires:"Lundi 19h00–20h30 · Mercredi 20h30–22h30", coachs:"Mathis, Tony" },
    { cat:"Seniors F", libelle:"Seniors féminines", type:"",        annees:"2008 et avant",  horaires:"Mardi 21h00 – 22h30", coachs:"Nicolas V." },
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
