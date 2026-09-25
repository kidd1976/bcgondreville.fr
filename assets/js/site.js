/* ═══════════════════════════════════════════
   BCG — Comportements du site
   ═══════════════════════════════════════════ */

/* ── Bandeaux d'information ─────────────────
   Les bandeaux etaient recopies page par page. Resultat : celui des
   anniversaires ne vivait que sur l'accueil, et les onze autres pages
   affichaient encore les seances decouverte de septembre, des semaines
   apres qu'elles soient passees. Un texte recopie douze fois n'est
   jamais corrige douze fois.

   Ils sont desormais poses ici, en haut de chaque page. Pour changer
   un message, une seule ligne a modifier : MSG_EFFECTIFS ci-dessous.  */
(function () {
  if (!document.body || document.querySelector('[data-bandeaux]')) return;

  /* ─────────────────────────────────────────────────────────────
     LE MESSAGE A METTRE A JOUR EN COURS DE SAISON
     Le jour ou une place se libere, c'est cette ligne qu'on corrige.
     Pour retirer completement ce bandeau : mettre une chaine vide.
     ───────────────────────────────────────────────────────────── */
  const MSG_EFFECTIFS =
    '<strong>Effectifs complets pour la saison 2026/27</strong> en U7, U9, U11 et U13' +
    ' — les inscriptions restent ouvertes en U15, U18 et Seniors';

  /* Les anciens bandeaux ecrits en dur dans les pages disparaissent.
     Sans cette ligne, les pages non encore mises a jour afficheraient
     deux bandeaux dores l'un sous l'autre, dont l'ancien, faux.       */
  document.querySelectorAll('.bandeau-info, #bcg-anniv').forEach(b => b.remove());

  const zone = document.createElement('div');
  zone.setAttribute('data-bandeaux', '1');

  /* 1. Les anniversaires du mois.
        Masque tant que l'app n'a pas repondu : un bandeau vide qui
        apparait puis se remplit fait sauter toute la page.           */
  const anniv = document.createElement('div');
  anniv.className = 'bandeau-anniv';
  anniv.setAttribute('aria-label', 'Anniversaires du mois');
  anniv.style.display = 'none';
  anniv.innerHTML = '<div class="bandeau-anniv__piste"></div>';
  zone.appendChild(anniv);

  /* 2. L'etat des effectifs. */
  if (MSG_EFFECTIFS) {
    const info = document.createElement('div');
    info.className = 'bandeau-info';
    info.setAttribute('aria-label', 'Inscriptions');
    /* Le defilement revient au depart a mi-course : la piste contient
       donc le message en double, deux fois. Sans ce doublon, le texte
       disparaitrait un instant a chaque tour.                        */
    info.innerHTML = '<div class="bandeau-info__piste">' +
      ('<span>' + MSG_EFFECTIFS + '</span>').repeat(4) + '</div>';
    zone.appendChild(info);
  }

  document.body.insertBefore(zone, document.body.firstChild);

  fetch('https://app.bcgondreville.fr/api/anniversaires.php')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.liste || !d.liste.length) return;
      const sep = '<span class="bandeau-anniv__sep">•</span>';
      const un = d.liste.map(function (x) {
        return '🎂 <strong>' + x.jour + ' ' + d.mois + '</strong> — ' + x.texte;
      }).join(sep) + sep;
      const piste = anniv.querySelector('.bandeau-anniv__piste');
      piste.innerHTML = '<span>' + un + '</span><span>' + un + '</span>';
      piste.classList.add('anim');
      anniv.style.display = '';
    })
    .catch(function () { /* app injoignable : le bandeau reste masque */ });
})();


/* ── Accès à l'espace club ──────────────────
   Le bouton est injecté ici plutôt que recopié dans les huit pages
   du site : une seule ligne à corriger le jour où l'adresse change.
   Il est placé juste avant « S'inscrire » — s'inscrire et se
   connecter ne s'adressent pas aux mêmes personnes.              */
(function () {
  const nav = document.getElementById('nav');
  if (!nav || nav.querySelector('[data-espace-club]')) return;

  const lien = document.createElement('a');
  lien.href = 'https://app.bcgondreville.fr/';
  lien.textContent = 'Se connecter';
  lien.title = 'Espace club — bureau et encadrants';
  lien.rel = 'noopener';
  lien.setAttribute('data-espace-club', '1');
  lien.style.cssText = 'border:1px solid currentColor;border-radius:8px;padding:6px 12px';

  const inscription = nav.querySelector('.btn-membre');
  if (inscription) nav.insertBefore(lien, inscription);
  else nav.appendChild(lien);

  /* Sur téléphone, le menu est replié dans le burger : un coach devrait
     l'ouvrir pour trouver la connexion. On sort donc un second bouton,
     posé dans le bandeau à côté du burger, visible en permanence.
     Les deux ne s'affichent jamais ensemble : l'un est masqué par
     média-requête quand l'autre apparaît. Le seuil suit celui du burger. */
  const barre = document.querySelector('.entete__inner');
  const burger = document.querySelector('.burger');
  if (barre && burger) {
    const style = document.createElement('style');
    style.textContent =
      '.lien-club-mobile{display:none}' +
      '@media(max-width:1100px){' +
        '.lien-club-mobile{display:inline-block;margin-left:auto;padding:7px 12px;' +
          'border:1px solid currentColor;border-radius:8px;font-size:13px;font-weight:700;' +
          'white-space:nowrap;color:var(--or,#e8b923);text-decoration:none}' +
        '.nav [data-espace-club]{display:none}' +
      '}' +
      /* Sur les petits telephones, le bandeau devient trop serre :
         le bouton maigrit pour laisser le burger entier a l'ecran. */
      '@media(max-width:430px){' +
        '.lien-club-mobile{padding:6px 8px;font-size:12px}' +
        '.entete__inner{gap:8px}' +
      '}';
    document.head.appendChild(style);

    const mobile = lien.cloneNode(true);
    mobile.className = 'lien-club-mobile';
    mobile.removeAttribute('style');
    mobile.setAttribute('data-espace-club', 'mobile');
    barre.insertBefore(mobile, burger);
  }

  /* Le pied de page : « Espace adhérent » menait a une page d'attente du
     site, et non a l'app. Deux noms differents pour une porte qui n'ouvrait
     nulle part. On le fait pointer sur l'app, avec le meme mot que dans le
     menu — une seule porte, un seul nom. */
  document.querySelectorAll(
    'a[href*="app.bcgondreville.fr"]:not([data-espace-club]), a[href*="espace-adherent"]'
  ).forEach(a => {
    a.textContent = 'Se connecter';
    a.href = 'https://app.bcgondreville.fr/';   /* la racine sert desormais l'app elle-meme */
  });
})();


/* ── Menu mobile ────────────────────────── */
(function () {
  const burger = document.querySelector('.burger');
  const nav    = document.getElementById('nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const ouvert = nav.getAttribute('data-ouvert') === 'true';
    nav.setAttribute('data-ouvert', String(!ouvert));
    burger.setAttribute('aria-expanded', String(!ouvert));
    burger.textContent = ouvert ? '☰' : '✕';
  });

  // Refermer au clic sur un lien
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      nav.setAttribute('data-ouvert', 'false');
      burger.setAttribute('aria-expanded', 'false');
      burger.textContent = '☰';
    })
  );
})();


/* ── Partenaires ────────────────────────────
   Source : API BCG Manager si MODE = "api",
   sinon données locales. Une modification dans
   BCG Manager se reflète ici au rechargement.  */
async function afficherPartenaires() {
  const zone = document.getElementById('zone-partenaires');
  if (!zone) return;

  const liste = await BCG.charger('partenaires');

  if (!liste.length) {
    zone.innerHTML = '<p class="chargement">Les partenaires seront annoncés prochainement.</p>';
    return;
  }

  zone.innerHTML = liste.map(p => `
    <article class="brique partenaire" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;min-height:150px">
      ${p.logo ? `<div style="height:64px;display:flex;align-items:center;justify-content:center">
        <img src="${p.logo}" alt="Logo ${p.nom}" loading="lazy"
             style="max-height:64px;max-width:150px;object-fit:contain">
      </div>` : ''}
      <div class="partenaire__nom">${p.web
        ? `<a href="${p.web}" target="_blank" rel="noopener">${p.nom}</a>`
        : p.nom}</div>
      ${p.lieu ? `<div class="partenaire__type">${p.lieu}</div>` : ''}
    </article>
  `).join('');
}


/* ── Équipes ─────────────────────────────────*/
async function afficherEquipes() {
  const zone = document.getElementById('zone-equipes');
  if (!zone) return;

  const liste = await BCG.charger('equipes');

  zone.innerHTML = liste.map(e => `
    <article class="brique equipe" style="align-items:flex-start">
      <div class="equipe__cat">${e.cat}</div>
      <div>
        <div class="equipe__nom">${e.libelle}${(e.type && e.type.length < 12) ? ' · ' + e.type : ''}</div>
        <div class="equipe__info">Nés en ${e.annees}</div>
        ${(e.horaires || (e.type && e.type.length >= 12)) ? `<div class="equipe__info" style="margin-top:4px">${e.horaires || e.type}</div>` : ''}
        ${e.coachs ? `<div class="equipe__info" style="margin-top:4px;color:var(--or)"><strong>Entraîneurs/Coachs :</strong> ${e.coachs}</div>` : ''}
      </div>
    </article>
  `).join('');
}


/* ── Prochains matchs ──────────────────────
   Scorenco fournit un widget d'intégration.
   En attendant l'identifiant réel du club, on
   affiche un message clair plutôt qu'un vide. */
async function afficherMatchs() {
  const zone = document.getElementById('zone-matchs');
  if (!zone) return;

  const matchs = await BCG.charger('matchs');

  if (!matchs.length) {
    zone.innerHTML = `
      <div class="brique" style="grid-column:1/-1;text-align:center">
        <h3>Calendrier bientôt disponible</h3>
        <p>Les matchs de la saison 2026/27 seront affichés ici dès la publication du calendrier par le Comité 54.</p>
      </div>`;
    return;
  }

  zone.innerHTML = matchs.map(m => `
    <article class="brique">
      <div style="font-family:var(--titre);font-size:26px;font-weight:900;color:var(--or);line-height:1">
        ${m.jour}<span style="font-size:13px;color:var(--txt-2);margin-left:6px">${m.mois}</span>
      </div>
      <h3 style="font-size:17px;margin:10px 0 4px">${m.domicile} — ${m.visiteur}</h3>
      <p>${m.categorie} · ${m.heure} · ${m.lieu}</p>
    </article>
  `).join('');
}


/* ── Démarrage ─────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  afficherPartenaires();
  afficherEquipes();
  afficherMatchs();
});
