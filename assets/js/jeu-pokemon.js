/* ═══════════════════════════════════════════════════════════
   POKÉ-CHOMP — mini-jeu façon labyrinthe pour le BC Gondreville
   Créatures 100 % maison, dessinées au canvas (aucun sprite tiers).
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ── 1. Labyrinthe ───────────────────────────────────────── */
const MAZE = [
  '############################',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o####.#####.##.#####.####o#',
  '#.####.#####.##.#####.####.#',
  '#..........................#',
  '#.####.##.########.##.####.#',
  '#.####.##.########.##.####.#',
  '#......##....##....##......#',
  '######.##### ## #####.######',
  '######.##### ## #####.######',
  '######.##          ##.######',
  '######.## ###--### ##.######',
  '######.## #      # ##.######',
  '          #      #          ',
  '######.## #      # ##.######',
  '######.## ######## ##.######',
  '######.##          ##.######',
  '######.## ######## ##.######',
  '######.## ######## ##.######',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#.####.#####.##.#####.####.#',
  '#o..##.......  .......##..o#',
  '###.##.##.########.##.##.###',
  '###.##.##.########.##.##.###',
  '#......##....##....##......#',
  '#.##########.##.##########.#',
  '#.##########.##.##########.#',
  '#..........................#',
  '############################'
];

const COLS = 28, ROWS = 31, TILE = 16;
const W = COLS * TILE, H = ROWS * TILE;

const EMPTY = 0, WALL = 1, DOOR = 2;
const NONE = 0, PELLET = 1, POWER = 2;

const grid = [], dots = [];
let dotsTotal = 0, dotsLeft = 0;

function buildGrid() {
  grid.length = 0; dots.length = 0; dotsTotal = 0;
  for (let r = 0; r < ROWS; r++) {
    const gr = [], dr = [];
    for (let c = 0; c < COLS; c++) {
      const ch = MAZE[r][c];
      gr.push(ch === '#' ? WALL : ch === '-' ? DOOR : EMPTY);
      if (ch === '.')      { dr.push(PELLET); dotsTotal++; }
      else if (ch === 'o') { dr.push(POWER);  dotsTotal++; }
      else                 { dr.push(NONE); }
    }
    grid.push(gr); dots.push(dr);
  }
  dotsLeft = dotsTotal;
}

const wrapCol = c => ((c % COLS) + COLS) % COLS;
const tileAt  = (c, r) => (r < 0 || r >= ROWS) ? WALL : grid[r][wrapCol(c)];
const centerX = c => c * TILE + TILE / 2;
const centerY = r => r * TILE + TILE / 2;
const tileOfX = x => Math.floor(x / TILE);
const tileOfY = y => Math.floor(y / TILE);

/* ── 2. Directions ───────────────────────────────────────── */
const UP    = { x: 0, y: -1, a: -Math.PI / 2, n: 'up'    };
const DOWN  = { x: 0, y:  1, a:  Math.PI / 2, n: 'down'  };
const LEFT  = { x: -1, y: 0, a:  Math.PI,     n: 'left'  };
const RIGHT = { x:  1, y: 0, a:  0,           n: 'right' };
const ALL_DIRS = [UP, LEFT, DOWN, RIGHT];
const DIR_BY_NAME = { up: UP, down: DOWN, left: LEFT, right: RIGHT };
const opposite = d => d === UP ? DOWN : d === DOWN ? UP : d === LEFT ? RIGHT : LEFT;

/* ── 3. Maison des créatures ─────────────────────────────── */
const HOUSE_EXIT = { c: 13, r: 11 };   // case juste au-dessus de la porte
const HOUSE_IN   = { c: 13, r: 14 };   // milieu de la maison
const PAC_START  = { c: 13, r: 23 };
const FRUIT_TILE = { c: 13, r: 17 };

/* Carte des distances vers la sortie de la maison (retour des créatures gobées) */
const homeDist = [];
function buildHomeDist() {
  homeDist.length = 0;
  for (let r = 0; r < ROWS; r++) homeDist.push(new Array(COLS).fill(Infinity));
  const q = [[HOUSE_EXIT.c, HOUSE_EXIT.r]];
  homeDist[HOUSE_EXIT.r][HOUSE_EXIT.c] = 0;
  while (q.length) {
    const [c, r] = q.shift();
    for (const d of ALL_DIRS) {
      const nc = wrapCol(c + d.x), nr = r + d.y;
      if (nr < 0 || nr >= ROWS) continue;
      if (grid[nr][nc] === WALL) continue;
      if (homeDist[nr][nc] > homeDist[r][c] + 1) {
        homeDist[nr][nc] = homeDist[r][c] + 1;
        q.push([nc, nr]);
      }
    }
  }
}

/* ── 4. Créatures : identités ────────────────────────────── */
const HERO = { nom: 'Voltichomp', corps: '#f7d117', clair: '#ffe97a', joue: '#e8563f' };

const MONSTRES = [
  { id: 'feu',  nom: 'Pyrogon',  corps: '#ff6a2b', clair: '#ffb27a', oeil: '#2b0d00',
    coin: { c: COLS - 2, r: 0 },        depart: { c: 13, r: 11 }, dansMaison: false, libere: 0  },
  { id: 'plante', nom: 'Foliboul', corps: '#2fc46a', clair: '#8ef0b2', oeil: '#06301a',
    coin: { c: 1, r: 0 },               depart: { c: 13, r: 14 }, dansMaison: true,  libere: 8  },
  { id: 'eau',  nom: 'Aquapik',   corps: '#35a8f5', clair: '#a8dcff', oeil: '#04263f',
    coin: { c: COLS - 2, r: ROWS - 1 }, depart: { c: 11, r: 14 }, dansMaison: true,  libere: 34 },
  { id: 'psy',  nom: 'Psykoss',   corps: '#c264f0', clair: '#e9c2ff', oeil: '#2b0740',
    coin: { c: 1, r: ROWS - 1 },        depart: { c: 16, r: 14 }, dansMaison: true,  libere: 64 }
];

const FRUITS = [
  { nom: 'Baie Ceriz',  couleur: '#e8563f', feuille: '#2fc46a', valeur: 100  },
  { nom: 'Baie Oran',   couleur: '#ff9f1c', feuille: '#2fc46a', valeur: 300  },
  { nom: 'Baie Sitrus', couleur: '#f7d117', feuille: '#2fc46a', valeur: 500  },
  { nom: 'Baie Prine',  couleur: '#7b5cf0', feuille: '#2fc46a', valeur: 700  },
  { nom: 'Baie Micle',  couleur: '#35a8f5', feuille: '#2fc46a', valeur: 1000 },
  { nom: 'Baie Lichii', couleur: '#ff5fa2', feuille: '#2fc46a', valeur: 2000 },
  { nom: 'Baie Nanab',  couleur: '#c264f0', feuille: '#2fc46a', valeur: 3000 },
  { nom: 'Baie d\'Or',  couleur: '#e8b923', feuille: '#2fc46a', valeur: 5000 }
];

/* ── 5. Réglages de jeu ──────────────────────────────────── */
const V_HERO      = 6.4 * TILE;   // px/s
const V_MONSTRE   = 6.0 * TILE;
const V_APEUREE   = 4.0 * TILE;
const V_GOBEE     = 13.0 * TILE;
const V_TUNNEL    = 3.4 * TILE;
const PHASES      = [7, 20, 7, 20, 5, 20, 5, Infinity]; // dispersion / chasse alternées
const VIES_DEPART = 3;
const BONUS_VIE   = 10000;

function dureeFrousse(niv) { return Math.max(1.5, 8 - (niv - 1) * 0.6); }
function multiVitesse(niv) { return Math.min(1.32, 1 + (niv - 1) * 0.05); }

/* ── 6. Audio (WebAudio, sans fichier externe) ───────────── */
const Son = (function () {
  let ctx = null, actif = true;
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function ton(freq, dur, type, vol, glisse) {
    if (!actif) return;
    const a = ac(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (glisse) o.frequency.exponentialRampToValueAtTime(Math.max(40, glisse), a.currentTime + dur);
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, a.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur + 0.02);
  }
  let alterne = false;
  return {
    reveil: () => ac(),
    get actif() { return actif; },
    set actif(v) { actif = v; },
    croque()  { alterne = !alterne; ton(alterne ? 380 : 300, 0.06, 'square', 0.045); },
    power()   { ton(200, 0.28, 'sawtooth', 0.05, 620); },
    gobe()    { ton(300, 0.18, 'square', 0.06, 900); setTimeout(() => ton(900, 0.14, 'square', 0.05, 1300), 90); },
    fruit()   { ton(700, 0.1, 'triangle', 0.06); setTimeout(() => ton(1050, 0.14, 'triangle', 0.06), 90); },
    perdu()   { ton(520, 0.5, 'sawtooth', 0.07, 90); },
    niveau()  { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => ton(f, 0.14, 'triangle', 0.06), i * 110)); },
    vie()     { [784, 1046].forEach((f, i) => setTimeout(() => ton(f, 0.12, 'triangle', 0.06), i * 110)); },
    fin()     { [440, 350, 260, 160].forEach((f, i) => setTimeout(() => ton(f, 0.26, 'sawtooth', 0.06), i * 200)); }
  };
})();

/* ── 7. État de la partie ────────────────────────────────── */
const cvs = document.getElementById('jeu-canvas');
if (!cvs) return;
const ctx = cvs.getContext('2d');
cvs.width = W; cvs.height = H;

const el = {
  score:  document.getElementById('jeu-score'),
  record: document.getElementById('jeu-record'),
  niveau: document.getElementById('jeu-niveau'),
  vies:   document.getElementById('jeu-vies'),
  son:    document.getElementById('jeu-son'),
  pause:  document.getElementById('jeu-pause'),
  rejouer:document.getElementById('jeu-rejouer'),
  info:   document.getElementById('jeu-info')
};

const CLE_RECORD = 'bcg-pokechomp-record';
let record = 0;
try { record = parseInt(localStorage.getItem(CLE_RECORD) || '0', 10) || 0; } catch (e) { record = 0; }

let etat = 'accueil';   // accueil | pret | jeu | pause | mort | niveau | fin
let score = 0, vies = VIES_DEPART, niveau = 1, dotsMange = 0, prochaineVie = BONUS_VIE;
let chrono = 0, phaseIdx = 0, phaseT = 0, mode = 'dispersion';
let frousseT = 0, chaineGobees = 0;
let fruit = null, fruitT = 0, fruitsSortis = 0;
let popups = [];        // petits scores flottants
let clignote = 0, flashNiveau = 0;

const hero = {
  x: centerX(PAC_START.c), y: centerY(PAC_START.r),
  dir: LEFT, souhait: null, bouche: 0, vivant: true, mortT: 0
};

let monstres = [];

function nouveauMonstre(def) {
  return {
    def,
    x: centerX(def.depart.c), y: centerY(def.depart.r),
    dir: def.dansMaison ? UP : LEFT,
    etat: def.dansMaison ? 'maison' : 'sorti',   // maison | sortie | sorti | gobee | entree
    bob: Math.random() * Math.PI * 2,
    reviveT: 0
  };
}

function resetEntites() {
  hero.x = centerX(PAC_START.c); hero.y = centerY(PAC_START.r);
  hero.dir = LEFT; hero.souhait = null; hero.bouche = 0; hero.vivant = true; hero.mortT = 0;
  monstres = MONSTRES.map(nouveauMonstre);
  phaseIdx = 0; phaseT = 0; mode = 'dispersion';
  frousseT = 0; chaineGobees = 0;
  fruit = null; fruitT = 0;
}

function nouvellePartie() {
  buildGrid();
  score = 0; vies = VIES_DEPART; niveau = 1; dotsMange = 0; fruitsSortis = 0;
  prochaineVie = BONUS_VIE; popups = [];
  resetEntites();
  etat = 'pret'; chrono = 0;
  majHUD();
}

function niveauSuivant() {
  niveau++;
  buildGrid();
  dotsMange = 0; fruitsSortis = 0;
  resetEntites();
  etat = 'pret'; chrono = 0;
  majHUD();
}

/* ── 8. HUD ──────────────────────────────────────────────── */
function majHUD() {
  el.score.textContent  = score.toLocaleString('fr-FR');
  el.record.textContent = record.toLocaleString('fr-FR');
  el.niveau.textContent = niveau;
  el.vies.innerHTML = '';
  for (let i = 0; i < Math.max(0, vies); i++) {
    const s = document.createElement('span');
    s.className = 'jeu-vie';
    el.vies.appendChild(s);
  }
}

function ajouteScore(pts, x, y) {
  score += pts;
  if (score >= prochaineVie) { vies++; prochaineVie += BONUS_VIE; Son.vie(); }
  if (score > record) {
    record = score;
    try { localStorage.setItem(CLE_RECORD, String(record)); } catch (e) {}
  }
  if (x !== undefined) popups.push({ txt: String(pts), x, y, t: 1 });
  majHUD();
}

/* ── 9. Déplacements ─────────────────────────────────────── */
function passable(c, r, e) {
  const t = tileAt(c, r);
  if (t === WALL) return false;
  if (t === DOOR) return !!(e && e.porteOK);
  return true;
}

function avance(e, dist) {
  let garde = 0;
  while (dist > 1e-6 && garde++ < 96) {
    const c = tileOfX(e.x), r = tileOfY(e.y);
    const cx = centerX(c), cy = centerY(r);

    /* pile au centre d'une case : c'est là qu'on tourne et qu'on teste les murs */
    if (Math.abs(e.x - cx) < 1e-4 && Math.abs(e.y - cy) < 1e-4) {
      e.x = cx; e.y = cy;
      if (e.auCentre) e.auCentre(c, r);
      if (!passable(c + e.dir.x, r + e.dir.y, e)) return;
    }

    /* distance jusqu'au prochain centre DANS LE SENS du déplacement */
    const sens = e.dir.x || e.dir.y;
    const ecart = (e.dir.x ? (e.x - cx) : (e.y - cy)) * sens;   // > 0 : centre déjà dépassé
    const versCentre = ecart >= 0 ? TILE - ecart : -ecart;

    const pas = Math.min(dist, versCentre);
    e.x += e.dir.x * pas;
    e.y += e.dir.y * pas;
    dist -= pas;

    /* on atteint le centre : on s'y cale exactement (pas de dérive flottante) */
    if (pas >= versCentre - 1e-9) {
      if (e.dir.x) e.x = centerX(Math.round((e.x - TILE / 2) / TILE));
      else         e.y = centerY(Math.round((e.y - TILE / 2) / TILE));
    }

    /* tunnel latéral */
    if (e.x < 0) e.x += W;
    else if (e.x >= W) e.x -= W;
  }
}

/* ── 10. Héros ───────────────────────────────────────────── */
hero.porteOK = false;
hero.auCentre = function (c, r) {
  if (hero.souhait && passable(c + hero.souhait.x, r + hero.souhait.y, hero)) {
    hero.dir = hero.souhait; hero.souhait = null;
  }
};

function donneDirection(d) {
  if (!d) return;
  if (etat === 'accueil' || etat === 'fin') { demarrer(); return; }
  if (etat === 'pret') { etat = 'jeu'; }
  if (etat === 'pause') return;
  if (d === opposite(hero.dir)) { hero.dir = d; hero.souhait = null; return; }
  hero.souhait = d;
}

function majHero(dt) {
  const v = V_HERO * multiVitesse(niveau) * (dotsAutour() ? 0.93 : 1);
  avance(hero, v * dt);
  hero.bouche = (hero.bouche + dt * 11) % (Math.PI * 2);

  const c = wrapCol(tileOfX(hero.x)), r = tileOfY(hero.y);
  if (r < 0 || r >= ROWS) return;
  const d = dots[r][c];
  if (d !== NONE) {
    dots[r][c] = NONE; dotsLeft--; dotsMange++;
    if (d === PELLET) { ajouteScore(10); Son.croque(); }
    else {
      ajouteScore(50); Son.power();
      frousseT = dureeFrousse(niveau); chaineGobees = 0;
      monstres.forEach(m => {
        if (m.etat === 'sorti') { m.dir = opposite(m.dir); m.effraye = true; }
        else if (m.etat === 'maison' || m.etat === 'sortie') m.effraye = true;
      });
    }
    if ((dotsMange === 70 || dotsMange === 170) && fruitsSortis < 2) {
      fruitsSortis++;
      fruit = FRUITS[Math.min(niveau - 1, FRUITS.length - 1)];
      fruitT = 9.5;
    }
    if (dotsLeft === 0) {
      etat = 'niveau'; flashNiveau = 2.2; Son.niveau();
    }
  }

  if (fruit) {
    const fx = centerX(FRUIT_TILE.c), fy = centerY(FRUIT_TILE.r);
    if (Math.hypot(hero.x - fx, hero.y - fy) < TILE * 0.8) {
      ajouteScore(fruit.valeur, fx, fy); Son.fruit(); fruit = null; fruitT = 0;
    }
  }
}

/* léger ralentissement quand le héros croque (comme dans l'arcade) */
function dotsAutour() {
  const c = wrapCol(tileOfX(hero.x)), r = tileOfY(hero.y);
  return r >= 0 && r < ROWS && dots[r][c] !== NONE;
}

/* ── 11. Créatures ───────────────────────────────────────── */
function cibleMonstre(m) {
  const hc = wrapCol(tileOfX(hero.x)), hr = tileOfY(hero.y);
  if (mode === 'dispersion') return m.def.coin;

  switch (m.def.id) {
    case 'feu':                                   // fonce droit sur le héros
      return { c: hc, r: hr };
    case 'plante': {                              // vise 4 cases devant
      return { c: hc + hero.dir.x * 4, r: hr + hero.dir.y * 4 };
    }
    case 'eau': {                                 // vecteur depuis Pyrogon
      const p = monstres[0];
      const pc = tileOfX(p.x), pr = tileOfY(p.y);
      const ac = hc + hero.dir.x * 2, ar = hr + hero.dir.y * 2;
      return { c: ac + (ac - pc), r: ar + (ar - pr) };
    }
    default: {                                    // timide : fuit de près
      const mc = tileOfX(m.x), mr = tileOfY(m.y);
      const d = Math.hypot(mc - hc, mr - hr);
      return d > 8 ? { c: hc, r: hr } : m.def.coin;
    }
  }
}

function choisitDir(m, c, r) {
  const options = [];
  for (const d of ALL_DIRS) {
    if (d === opposite(m.dir)) continue;
    if (!passable(c + d.x, r + d.y, m)) continue;
    options.push(d);
  }
  if (!options.length) { m.dir = opposite(m.dir); return; }

  if (m.etat === 'gobee') {
    let best = options[0], bd = Infinity;
    for (const d of options) {
      const nc = wrapCol(c + d.x), nr = r + d.y;
      const v = (nr >= 0 && nr < ROWS) ? homeDist[nr][nc] : Infinity;
      if (v < bd) { bd = v; best = d; }
    }
    m.dir = best; return;
  }

  if (m.effraye && frousseT > 0) {
    m.dir = options[(Math.random() * options.length) | 0];
    return;
  }

  const t = cibleMonstre(m);
  let best = options[0], bd = Infinity;
  for (const d of options) {
    const dist = Math.hypot((c + d.x) - t.c, (r + d.y) - t.r);
    if (dist < bd) { bd = dist; best = d; }
  }
  m.dir = best;
}

function majMonstre(m, dt) {
  m.porteOK = (m.etat === 'gobee' || m.etat === 'entree' || m.etat === 'sortie');

  /* — dans la maison : petit va-et-vient — */
  if (m.etat === 'maison') {
    m.bob += dt * 3.2;
    m.y = centerY(m.def.depart.r) + Math.sin(m.bob) * 3.5;
    if (m.reviveT > 0) { m.reviveT -= dt; return; }
    if (dotsMange >= m.def.libere || chrono > 4 + MONSTRES.indexOf(m.def) * 3) m.etat = 'sortie';
    return;
  }

  /* — sortie scriptée par la porte — */
  if (m.etat === 'sortie') {
    const cibleX = centerX(HOUSE_EXIT.c), cibleY = centerY(HOUSE_EXIT.r);
    const v = V_MONSTRE * dt;
    if (Math.abs(m.y - centerY(HOUSE_IN.r)) > 0.5 && Math.abs(m.x - cibleX) > 0.5) {
      m.y += Math.sign(centerY(HOUSE_IN.r) - m.y) * Math.min(v, Math.abs(centerY(HOUSE_IN.r) - m.y));
    } else if (Math.abs(m.x - cibleX) > 0.5) {
      m.dir = m.x < cibleX ? RIGHT : LEFT;
      m.x += Math.sign(cibleX - m.x) * Math.min(v, Math.abs(cibleX - m.x));
    } else {
      m.x = cibleX; m.dir = UP;
      m.y -= Math.min(v, m.y - cibleY);
      if (m.y <= cibleY + 0.01) { m.y = cibleY; m.etat = 'sorti'; m.dir = Math.random() < 0.5 ? LEFT : RIGHT; }
    }
    return;
  }

  /* — retour à la maison après avoir été gobée — */
  if (m.etat === 'entree') {
    const cibleY = centerY(HOUSE_IN.r), cibleX = centerX(HOUSE_IN.c);
    const v = V_GOBEE * dt;
    m.dir = DOWN;
    m.x += Math.sign(cibleX - m.x) * Math.min(v, Math.abs(cibleX - m.x));
    m.y += Math.min(v, cibleY - m.y);
    if (m.y >= cibleY - 0.01) {
      m.y = cibleY; m.etat = 'maison'; m.effraye = false; m.reviveT = 0.6; m.dir = UP;
    }
    return;
  }

  /* — déplacement normal dans le labyrinthe — */
  let v;
  if (m.etat === 'gobee') v = V_GOBEE;
  else if (m.effraye && frousseT > 0) v = V_APEUREE * multiVitesse(niveau);
  else {
    const r = tileOfY(m.y);
    const enTunnel = (r === 14 && (m.x < 6 * TILE || m.x > (COLS - 6) * TILE));
    v = (enTunnel ? V_TUNNEL : V_MONSTRE) * multiVitesse(niveau);
  }

  m.auCentre = function (c, r) {
    if (m.etat === 'gobee' && c === HOUSE_EXIT.c && r === HOUSE_EXIT.r) {
      m.etat = 'entree'; return;
    }
    choisitDir(m, c, r);
  };
  avance(m, v * dt);
}

/* ── 12. Collisions & phases ─────────────────────────────── */
function majPhases(dt) {
  if (frousseT > 0) {
    frousseT -= dt;
    if (frousseT <= 0) { frousseT = 0; monstres.forEach(m => m.effraye = false); chaineGobees = 0; }
    return;                          // les phases sont gelées pendant la frousse
  }
  phaseT += dt;
  const duree = PHASES[Math.min(phaseIdx, PHASES.length - 1)];
  if (phaseT >= duree) {
    phaseT = 0; phaseIdx++;
    mode = (phaseIdx % 2 === 0) ? 'dispersion' : 'chasse';
    monstres.forEach(m => { if (m.etat === 'sorti') m.dir = opposite(m.dir); });
  }
}

function majCollisions() {
  for (const m of monstres) {
    if (m.etat === 'gobee' || m.etat === 'entree') continue;
    if (Math.hypot(m.x - hero.x, m.y - hero.y) > TILE * 0.72) continue;

    if (m.effraye && frousseT > 0) {
      chaineGobees = Math.min(chaineGobees + 1, 4);
      ajouteScore(200 * Math.pow(2, chaineGobees - 1), m.x, m.y);
      m.etat = 'gobee'; m.effraye = false;
      Son.gobe();
    } else if (m.etat === 'sorti') {
      etat = 'mort'; hero.mortT = 0; hero.vivant = false;
      Son.perdu();
      return;
    }
  }
}

/* ── 13. Boucle ──────────────────────────────────────────── */
function maj(dt) {
  clignote += dt;
  popups = popups.filter(p => { p.t -= dt * 1.1; p.y -= dt * 16; return p.t > 0; });

  if (etat === 'pret') {
    chrono += dt;
    if (chrono > 1.9) { etat = 'jeu'; chrono = 0; }
    return;
  }
  if (etat === 'mort') {
    hero.mortT += dt;
    if (hero.mortT > 1.7) {
      vies--; majHUD();
      if (vies <= 0) { etat = 'fin'; Son.fin(); }
      else { resetEntites(); etat = 'pret'; chrono = 0; }
    }
    return;
  }
  if (etat === 'niveau') {
    flashNiveau -= dt;
    if (flashNiveau <= 0) niveauSuivant();
    return;
  }
  if (etat !== 'jeu') return;

  chrono += dt;
  majPhases(dt);
  majHero(dt);
  monstres.forEach(m => majMonstre(m, dt));
  majCollisions();

  if (fruitT > 0) { fruitT -= dt; if (fruitT <= 0) fruit = null; }
}

let dernier = 0;
function boucle(t) {
  requestAnimationFrame(boucle);
  if (!dernier) dernier = t;
  let dt = (t - dernier) / 1000;
  dernier = t;
  if (dt > 0.05) dt = 0.05;          // évite les sauts après un changement d'onglet
  maj(dt);
  dessine();
}

/* ── 14. Rendu : labyrinthe ──────────────────────────────── */
const fondCvs = document.createElement('canvas');
fondCvs.width = W; fondCvs.height = H;
const fondCtx = fondCvs.getContext('2d');
let fondNiveau = -1;

function couleursNiveau(n) {
  const palettes = [
    ['#12b06a', '#0a5c39'], ['#35a8f5', '#0c4a78'], ['#c264f0', '#4b1a6b'],
    ['#e8b923', '#7a5c07'], ['#ff6a2b', '#7c2c07'], ['#2fe0c4', '#0a5b52']
  ];
  return palettes[(n - 1) % palettes.length];
}

function cheminArrondi(x, y, w, h, tl, tr, br, bl) {
  fondCtx.beginPath();
  fondCtx.moveTo(x + tl, y);
  fondCtx.lineTo(x + w - tr, y);
  fondCtx.quadraticCurveTo(x + w, y, x + w, y + tr);
  fondCtx.lineTo(x + w, y + h - br);
  fondCtx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  fondCtx.lineTo(x + bl, y + h);
  fondCtx.quadraticCurveTo(x, y + h, x, y + h - bl);
  fondCtx.lineTo(x, y + tl);
  fondCtx.quadraticCurveTo(x, y, x + tl, y);
  fondCtx.closePath();
}

function dessineFond() {
  const [vif, sombre] = couleursNiveau(niveau);
  fondCtx.clearRect(0, 0, W, H);
  fondCtx.fillStyle = '#050f0a';
  fondCtx.fillRect(0, 0, W, H);

  const R = 6, ins = 2.5;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = grid[r][c];
      if (t === DOOR) {
        fondCtx.fillStyle = '#ffd9ea';
        fondCtx.fillRect(c * TILE, r * TILE + TILE / 2 - 1.5, TILE, 3);
        continue;
      }
      if (t !== WALL) continue;
      const haut = tileAt(c, r - 1) === WALL, bas = tileAt(c, r + 1) === WALL;
      const gau  = tileAt(c - 1, r) === WALL, dro = tileAt(c + 1, r) === WALL;
      const x = c * TILE + ins, y = r * TILE + ins;
      const w = TILE - ins * 2 + (dro ? ins * 2 : 0) - 0, h = TILE - ins * 2 + (bas ? ins * 2 : 0);
      const x2 = gau ? x - ins * 2 : x, y2 = haut ? y - ins * 2 : y;
      const w2 = gau ? w + ins * 2 : w, h2 = haut ? h + ins * 2 : h;
      cheminArrondi(
        x2, y2, w2, h2,
        (haut || gau) ? 0 : R, (haut || dro) ? 0 : R,
        (bas || dro) ? 0 : R, (bas || gau) ? 0 : R
      );
      const g = fondCtx.createLinearGradient(x2, y2, x2, y2 + h2);
      g.addColorStop(0, vif); g.addColorStop(1, sombre);
      fondCtx.fillStyle = g;
      fondCtx.fill();
    }
  }
  fondNiveau = niveau;
}

/* ── 15. Rendu : créatures ───────────────────────────────── */

/* silhouette commune : dôme + bas ondulé (3 lobes animés) */
function silhouette(g, r, houle) {
  g.beginPath();
  g.arc(0, -r * 0.16, r, Math.PI, 0);
  g.lineTo(r, r * 0.52);
  const n = 3, seg = (2 * r) / n;
  for (let i = 0; i < n; i++) {
    const cx = r - seg * (i + 0.5);
    g.arc(cx, r * 0.52 + (i % 2 ? houle : -houle), seg / 2, 0, Math.PI, false);
  }
  g.lineTo(-r, -r * 0.16);
  g.closePath();
}

function yeux(g, r, dir, teinte, gobee) {
  const ox = dir.x * r * 0.15, oy = dir.y * r * 0.13;
  [-1, 1].forEach(s => {
    g.fillStyle = '#ffffff';
    g.beginPath(); g.ellipse(s * r * 0.34, -r * 0.24, r * 0.27, r * 0.31, 0, 0, 7); g.fill();
    g.fillStyle = gobee ? '#39b7ff' : teinte;
    g.beginPath(); g.arc(s * r * 0.34 + ox, -r * 0.24 + oy, r * 0.145, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.beginPath(); g.arc(s * r * 0.34 + ox - r * 0.05, -r * 0.3 + oy, r * 0.05, 0, 7); g.fill();
  });
}

/* attributs d'espèce dessinés DERRIÈRE le corps */
function attributsArriere(g, id, r, corps, clair, t) {
  if (id === 'feu') {                                   // crête et queue de flamme
    const vacille = Math.sin(t * 9) * r * 0.12;
    g.fillStyle = '#ffcc33';
    g.beginPath();
    g.moveTo(-r * 0.78, -r * 0.55);
    g.quadraticCurveTo(-r * 0.82, -r * 1.75 + vacille, -r * 0.12, -r * 0.8);
    g.quadraticCurveTo(r * 0.06, -r * 2.15 - vacille, r * 0.42, -r * 0.78);
    g.quadraticCurveTo(r * 0.92, -r * 1.6 + vacille, r * 0.82, -r * 0.4);
    g.closePath(); g.fill();
    g.fillStyle = '#ff8a2b';
    g.beginPath();
    g.moveTo(-r * 0.34, -r * 0.72);
    g.quadraticCurveTo(-r * 0.06, -r * 1.5 + vacille, r * 0.26, -r * 0.68);
    g.closePath(); g.fill();
    g.fillStyle = '#ffcc33';                            // queue
    g.beginPath();
    g.moveTo(-r * 0.7, r * 0.15);
    g.quadraticCurveTo(-r * 1.75, r * 0.05 + vacille, -r * 1.5, -r * 0.85);
    g.quadraticCurveTo(-r * 1.28, r * 0.05, -r * 0.66, r * 0.6);
    g.closePath(); g.fill();
  } else if (id === 'plante') {                          // grande feuille + tige
    const balance = Math.sin(t * 4) * 0.14;
    g.save();
    g.translate(0, -r * 0.78); g.rotate(balance);
    g.strokeStyle = '#1a7a3f'; g.lineWidth = r * 0.12; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, r * 0.34); g.lineTo(0, -r * 0.42); g.stroke();
    g.fillStyle = '#2aa356';
    g.beginPath(); g.ellipse(r * 0.6, -r * 0.55, r * 0.62, r * 0.27, -0.45, 0, 7); g.fill();
    g.fillStyle = '#38c76c';
    g.beginPath(); g.ellipse(-r * 0.5, -r * 0.38, r * 0.5, r * 0.23, 0.5, 0, 7); g.fill();
    g.restore();
  } else if (id === 'eau') {                             // aileron dorsal + nageoires
    g.fillStyle = '#0f6fb8';
    g.beginPath();
    g.moveTo(-r * 0.5, -r * 0.78);
    g.lineTo(-r * 0.02, -r * 2.0);
    g.lineTo(r * 0.46, -r * 0.72);
    g.closePath(); g.fill();
    g.fillStyle = '#1487d6';
    [-1, 1].forEach(s => {
      g.beginPath();
      g.moveTo(s * r * 0.7, -r * 0.3);
      g.quadraticCurveTo(s * r * 1.6, -r * 0.15, s * r * 1.35, r * 0.6);
      g.quadraticCurveTo(s * r * 0.95, r * 0.1, s * r * 0.6, r * 0.2);
      g.closePath(); g.fill();
    });
  } else {                                               // grandes oreilles psy
    g.fillStyle = corps;
    [-1, 1].forEach(s => {
      g.beginPath();
      g.moveTo(s * r * 0.26, -r * 0.78);
      g.quadraticCurveTo(s * r * 1.15, -r * 2.15, s * r * 1.06, -r * 0.48);
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)';
      g.beginPath();
      g.moveTo(s * r * 0.44, -r * 0.76);
      g.quadraticCurveTo(s * r * 0.95, -r * 1.72, s * r * 0.9, -r * 0.58);
      g.closePath(); g.fill();
      g.fillStyle = corps;
    });
  }
}

/* attributs d'espèce dessinés SUR le corps */
function attributsAvant(g, id, r, clair, t) {
  if (id === 'feu') {
    g.fillStyle = 'rgba(255,225,150,.55)';
    g.beginPath(); g.ellipse(0, r * 0.3, r * 0.42, r * 0.3, 0, 0, 7); g.fill();
  } else if (id === 'plante') {
    g.fillStyle = 'rgba(255,255,255,.4)';
    [[-0.3, 0.3], [0.3, 0.3], [0, 0.52]].forEach(([x, y]) => {
      g.beginPath(); g.arc(x * r, y * r, r * 0.11, 0, 7); g.fill();
    });
  } else if (id === 'eau') {
    g.fillStyle = 'rgba(255,255,255,.45)';
    g.beginPath(); g.ellipse(0, r * 0.28, r * 0.44, r * 0.32, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(10,70,120,.5)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(-r * 0.4, r * 0.28); g.lineTo(r * 0.4, r * 0.28); g.stroke();
  } else {
    g.fillStyle = '#ffe27a';                              // gemme frontale
    g.beginPath();
    g.moveTo(0, -r * 0.78); g.lineTo(r * 0.17, -r * 0.58);
    g.lineTo(0, -r * 0.38); g.lineTo(-r * 0.17, -r * 0.58);
    g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.32)';
    [-1, 1].forEach(s => { g.beginPath(); g.arc(s * r * 0.6, r * 0.16, r * 0.16, 0, 7); g.fill(); });
  }
}

function dessineMonstre(m) {
  const g = ctx, r = TILE * 0.7;
  const effraye = m.effraye && frousseT > 0 && m.etat !== 'gobee' && m.etat !== 'entree';
  const finFrousse = effraye && frousseT < 2.2 && Math.floor(frousseT * 6) % 2 === 0;
  const gobee = m.etat === 'gobee' || m.etat === 'entree';
  const houle = Math.sin(clignote * 8 + m.x * 0.06) * r * 0.13;

  const corps = effraye ? (finFrousse ? '#f3f6ff' : '#2b48d8') : m.def.corps;
  const clair = effraye ? (finFrousse ? '#ffffff' : '#7a90ff') : m.def.clair;

  g.save();
  g.translate(m.x, m.y);

  if (!gobee) {
    if (!effraye) attributsArriere(g, m.def.id, r, corps, clair, clignote);

    silhouette(g, r, houle);
    const grad = g.createLinearGradient(0, -r, 0, r);
    grad.addColorStop(0, clair); grad.addColorStop(0.62, corps); grad.addColorStop(1, corps);
    g.fillStyle = grad; g.fill();

    if (!effraye) attributsAvant(g, m.def.id, r, clair, clignote);
  }

  if (effraye) {                                   /* tête apeurée */
    const t = finFrousse ? '#d92b2b' : '#dfe6ff';
    g.fillStyle = t;
    [-1, 1].forEach(s => { g.beginPath(); g.arc(s * r * 0.33, -r * 0.24, r * 0.15, 0, 7); g.fill(); });
    g.strokeStyle = t; g.lineWidth = 2.2; g.lineJoin = 'round';
    g.beginPath();
    for (let i = 0; i <= 6; i++) g.lineTo(-r * 0.55 + i * r * 0.183, r * 0.2 + (i % 2 ? -r * 0.14 : r * 0.06));
    g.stroke();
  } else {
    yeux(g, r, m.dir, m.def.oeil, gobee);
    if (!gobee) {                                   /* petite bouche */
      g.strokeStyle = 'rgba(20,10,0,.5)'; g.lineWidth = 1.6; g.lineCap = 'round';
      g.beginPath(); g.arc(0, r * 0.02, r * 0.16, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke();
    }
  }
  g.restore();
}

function dessineHeros(x, y, dir, bouche, mort, tMort) {
  const g = ctx, r = TILE * 0.7;
  g.save();
  g.translate(x, y);

  if (mort) {
    const p = Math.min(1, tMort / 1.5);
    g.rotate(p * Math.PI * 3);
    g.scale(1 - p * 0.85, 1 - p * 0.85);
    g.globalAlpha = Math.max(0, 1 - p);
  }

  const ouverture = mort ? 1.0 : (0.05 + Math.abs(Math.sin(bouche)) * 0.46);
  const gauche = dir === LEFT;

  /* oreilles + queue éclair, dans un repère qui se retourne selon le sens */
  g.save();
  if (gauche) g.scale(-1, 1);
  g.fillStyle = HERO.corps;
  g.beginPath();                                    // queue en éclair
  g.moveTo(-r * 0.55, r * 0.05);
  g.lineTo(-r * 1.25, -r * 0.35);
  g.lineTo(-r * 0.95, r * 0.08);
  g.lineTo(-r * 1.45, r * 0.62);
  g.lineTo(-r * 0.8, r * 0.42);
  g.closePath(); g.fill();
  [[-0.62, -0.72, -0.5], [0.28, -0.86, 0.25]].forEach(([ox, oy, inc]) => {
    g.save();
    g.translate(ox * r, oy * r); g.rotate(inc);
    g.fillStyle = HERO.corps;
    g.beginPath();
    g.moveTo(-r * 0.24, r * 0.42);
    g.quadraticCurveTo(-r * 0.16, -r * 0.5, 0, -r * 0.86);
    g.quadraticCurveTo(r * 0.16, -r * 0.42, r * 0.26, r * 0.38);
    g.closePath(); g.fill();
    g.fillStyle = '#2f2410';                        // pointe sombre
    g.beginPath();
    g.moveTo(-r * 0.11, -r * 0.46);
    g.quadraticCurveTo(0, -r * 0.9, r * 0.12, -r * 0.44);
    g.quadraticCurveTo(0, -r * 0.32, -r * 0.11, -r * 0.46);
    g.closePath(); g.fill();
    g.restore();
  });
  g.restore();

  /* corps rond avec la bouche qui croque, orientée dans le sens de marche */
  const grad = g.createRadialGradient(-r * 0.28, -r * 0.34, r * 0.12, 0, 0, r);
  grad.addColorStop(0, HERO.clair); grad.addColorStop(1, HERO.corps);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, 0);
  g.arc(0, 0, r, dir.a + ouverture, dir.a - ouverture);
  g.closePath();
  g.fill();

  /* joues et yeux, toujours à l'endroit */
  g.save();
  if (gauche) g.scale(-1, 1);
  g.fillStyle = HERO.joue;
  g.beginPath(); g.arc(r * 0.46, r * 0.26, r * 0.19, 0, 7); g.fill();
  g.globalAlpha = 0.7;
  g.beginPath(); g.arc(-r * 0.5, r * 0.24, r * 0.15, 0, 7); g.fill();
  g.globalAlpha = 1;
  g.fillStyle = '#231a06';
  g.beginPath(); g.arc(r * 0.31, -r * 0.34, r * 0.14, 0, 7); g.fill();
  g.beginPath(); g.arc(-r * 0.33, -r * 0.36, r * 0.12, 0, 7); g.fill();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(r * 0.35, -r * 0.39, r * 0.05, 0, 7); g.fill();
  g.beginPath(); g.arc(-r * 0.3, -r * 0.4, r * 0.04, 0, 7); g.fill();
  g.restore();

  g.restore();
}

function dessineFruit(x, y, f) {
  const g = ctx;
  g.save();
  g.translate(x, y);
  const p = 1 + Math.sin(clignote * 5) * 0.06;
  g.scale(p, p);
  g.fillStyle = f.couleur;
  g.beginPath(); g.arc(0, TILE * 0.12, TILE * 0.5, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.45)';
  g.beginPath(); g.arc(-TILE * 0.16, -TILE * 0.02, TILE * 0.14, 0, 7); g.fill();
  g.fillStyle = f.feuille;
  g.beginPath(); g.ellipse(TILE * 0.2, -TILE * 0.4, TILE * 0.26, TILE * 0.12, -0.5, 0, 7); g.fill();
  g.strokeStyle = '#5a3a12'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, -TILE * 0.32); g.lineTo(0, -TILE * 0.52); g.stroke();
  g.restore();
}

/* ── 16. Rendu global ────────────────────────────────────── */
function texteCentre(txt, y, taille, couleur, sousTitre) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 ' + taille + 'px "Barlow Condensed", Impact, sans-serif';
  ctx.fillStyle = 'rgba(3,10,6,.72)';
  ctx.fillRect(0, y - taille, W, taille * (sousTitre ? 2.5 : 1.5));
  ctx.fillStyle = couleur;
  ctx.fillText(txt, W / 2, y);
  if (sousTitre) {
    ctx.font = '700 13px Lato, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.86)';
    ctx.fillText(sousTitre, W / 2, y + taille * 0.9);
  }
  ctx.restore();
}

function dessine() {
  if (fondNiveau !== niveau) dessineFond();

  ctx.clearRect(0, 0, W, H);
  const flash = (etat === 'niveau' && Math.floor(flashNiveau * 6) % 2 === 0);
  ctx.globalAlpha = flash ? 0.35 : 1;
  ctx.drawImage(fondCvs, 0, 0);
  ctx.globalAlpha = 1;

  /* pastilles */
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = dots[r][c];
      if (d === NONE) continue;
      const x = centerX(c), y = centerY(r);
      if (d === PELLET) {
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.arc(x, y, 2.1, 0, 7); ctx.fill();
      } else {
        const p = 3.8 + Math.sin(clignote * 7) * 1.4;
        ctx.fillStyle = '#e8b923';
        ctx.shadowColor = '#e8b923'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, p, 0, 7); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff6d0';
        ctx.beginPath(); ctx.arc(x - 1, y - 1.4, p * 0.35, 0, 7); ctx.fill();
      }
    }
  }

  if (fruit) dessineFruit(centerX(FRUIT_TILE.c), centerY(FRUIT_TILE.r), fruit);

  if (etat !== 'mort') monstres.forEach(dessineMonstre);
  dessineHeros(hero.x, hero.y, hero.dir, hero.bouche, etat === 'mort', hero.mortT);

  /* scores flottants */
  popups.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.t);
    ctx.fillStyle = '#7fe9ff';
    ctx.font = '900 14px "Barlow Condensed", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.txt, p.x, p.y);
    ctx.restore();
  });

  /* messages */
  if (etat === 'accueil')      texteCentre('POKÉ-CHOMP', H / 2 - 10, 40, '#e8b923', 'Flèches, ZQSD ou balayage — appuie pour jouer');
  else if (etat === 'pret')    texteCentre('PRÊT !', H / 2 + 30, 32, '#e8b923');
  else if (etat === 'pause')   texteCentre('PAUSE', H / 2 + 30, 32, '#ffffff', 'P ou le bouton pour reprendre');
  else if (etat === 'fin')     texteCentre('PARTIE TERMINÉE', H / 2 - 10, 34, '#ff8a5c', 'Score : ' + score.toLocaleString('fr-FR') + ' — appuie pour rejouer');
  else if (etat === 'niveau')  texteCentre('NIVEAU ' + niveau + ' TERMINÉ', H / 2 - 10, 30, '#7cf5a8');
}

/* ── 17. Commandes ───────────────────────────────────────── */
function demarrer() { Son.reveil(); nouvellePartie(); }

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  let d = null;
  if (k === 'arrowup' || k === 'z' || k === 'w') d = UP;
  else if (k === 'arrowdown' || k === 's') d = DOWN;
  else if (k === 'arrowleft' || k === 'q' || k === 'a') d = LEFT;
  else if (k === 'arrowright' || k === 'd') d = RIGHT;

  if (d) { e.preventDefault(); Son.reveil(); donneDirection(d); return; }
  if (k === 'p' || k === 'escape') { e.preventDefault(); basculePause(); }
  if (k === 'enter' || k === ' ') {
    e.preventDefault();
    if (etat === 'accueil' || etat === 'fin') demarrer();
    else if (etat === 'pret') etat = 'jeu';
  }
}, { passive: false });

function basculePause() {
  if (etat === 'jeu') { etat = 'pause'; el.pause.textContent = '▶ Reprendre'; }
  else if (etat === 'pause') { etat = 'jeu'; el.pause.textContent = '⏸ Pause'; }
}

el.pause.addEventListener('click', () => { Son.reveil(); basculePause(); });
el.rejouer.addEventListener('click', () => { el.pause.textContent = '⏸ Pause'; demarrer(); });
el.son.addEventListener('click', () => {
  Son.actif = !Son.actif;
  el.son.textContent = Son.actif ? '🔊 Son' : '🔇 Son';
  el.son.setAttribute('aria-pressed', String(Son.actif));
  if (Son.actif) Son.reveil();
});

document.querySelectorAll('[data-dir]').forEach(b => {
  const envoie = e => { e.preventDefault(); Son.reveil(); donneDirection(DIR_BY_NAME[b.dataset.dir]); };
  b.addEventListener('touchstart', envoie, { passive: false });
  b.addEventListener('mousedown', envoie);
});

/* balayage tactile sur le plateau */
let tX = 0, tY = 0;
cvs.addEventListener('touchstart', e => {
  const t = e.changedTouches[0]; tX = t.clientX; tY = t.clientY;
  Son.reveil();
  if (etat === 'accueil' || etat === 'fin') demarrer();
}, { passive: true });
cvs.addEventListener('touchmove', e => { if (etat === 'jeu' || etat === 'pret') e.preventDefault(); }, { passive: false });
cvs.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - tX, dy = t.clientY - tY;
  if (Math.hypot(dx, dy) < 18) return;
  donneDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RIGHT : LEFT) : (dy > 0 ? DOWN : UP));
}, { passive: true });

cvs.addEventListener('mousedown', () => { Son.reveil(); if (etat === 'accueil' || etat === 'fin') demarrer(); });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && etat === 'jeu') { etat = 'pause'; el.pause.textContent = '▶ Reprendre'; }
});

/* ── 18. Sonde (tests automatisés) ───────────────────────── */
window.PokeChomp = {
  etat: () => ({
    etat, score, niveau, vies, dotsLeft, mode, frousseT: +frousseT.toFixed(2), chrono: +chrono.toFixed(1),
    fruit: fruit ? fruit.nom : null,
    hero: { x: +hero.x.toFixed(1), y: +hero.y.toFixed(1), c: tileOfX(hero.x), r: tileOfY(hero.y), dir: hero.dir.n },
    monstres: monstres.map(m => ({
      nom: m.def.nom, etat: m.etat, c: tileOfX(m.x), r: tileOfY(m.y),
      x: +m.x.toFixed(1), y: +m.y.toFixed(1), dir: m.dir.n, effraye: !!m.effraye
    }))
  }),
  plateau: () => dots.map(l => l.map(v => v === POWER ? 'o' : v === PELLET ? '.' : ' ').join('')),
  murs: () => MAZE.slice(),
  pousse: n => donneDirection(DIR_BY_NAME[n]),
  demarre: () => demarrer()
};

/* ── 19. Démarrage ───────────────────────────────────────── */
buildGrid();
buildHomeDist();
resetEntites();
majHUD();
etat = 'accueil';
requestAnimationFrame(boucle);

})();
