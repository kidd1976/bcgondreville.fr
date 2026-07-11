/* ═══════════════════════════════════════════
   BCG — Comportements du site
   ═══════════════════════════════════════════ */

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
        ${e.coachs ? `<div class="equipe__info" style="margin-top:4px;color:var(--or)"><strong>Coachs :</strong> ${e.coachs}</div>` : ''}
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
