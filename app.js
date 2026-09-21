/* ───────────────────────────────────────────────
   गणपती आमंत्रण — behaviour

   The scrolling is not implemented here. Four empty .anchor sections
   drive the browser's own mandatory snap, and `scroll-snap-stop:
   always` forbids a flick from carrying past one of them. This file
   only *listens*: an IntersectionObserver reports which anchor the
   page has settled on, and everything visible is drawn from that one
   number. There is no wheel handler, no momentum timer and no gesture
   heuristic, so there is nothing left to tune or to get wrong.
   ─────────────────────────────────────────────── */

/* The exact Google Maps pin for "सुधानंद".
   It resolves to 21.115528, 79.107259 — kept written down here because
   goo.gl short links are on Google's deprecation list, so if this one
   ever stops resolving, swap in the coordinate form:
   https://www.google.com/maps/search/?api=1&query=21.115528,79.107259 */
const MAP_URL = 'https://goo.gl/maps/s25ybdKTFqTCCTAf7?g_st=aw';
const MAP_FALLBACK =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Juna Subhedar Layout Extension, Nagpur 440024');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ───────────── map link ───────────── */

const mapLink = document.getElementById('map-link');
if (mapLink) mapLink.href = MAP_URL || MAP_FALLBACK;

/* ───────────── butterflies ─────────────
   the supplied line-art, carried as an alpha mask over the palette
   gradient (assets/butterfly.png). Each wing is its own half so the
   pair can fold toward the body. */

document.querySelectorAll('.bfly').forEach((el) => {
  el.innerHTML = '<i class="bf-half bf-half--l"></i><i class="bf-half bf-half--r"></i>';
});

/* ───────────── the idol ground ─────────────
   idol.jpeg is the background. The drawn idol is kept only as a
   fallback if that file ever goes missing; a video clip, if one is
   added later, takes over from the photograph once it is playing. */

const stage = document.querySelector('.stage');
const photo = document.querySelector('.stage__photo');
const video = document.querySelector('.stage__video');

if (stage && photo) {
  const noPhoto = () => stage.classList.add('no-photo');
  photo.addEventListener('error', noPhoto, { once: true });
  if (photo.complete && photo.naturalWidth === 0) noPhoto();
}

if (stage && video) {
  video.addEventListener('playing', () => stage.classList.add('has-video'), { once: true });
  const attempt = video.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {
      const kick = () => { video.play().catch(() => {}); };
      document.addEventListener('touchstart', kick, { once: true, passive: true });
      document.addEventListener('click', kick, { once: true });
    });
  }
}

/* ───────────── the four views ───────────── */

const anchors = Array.from(document.querySelectorAll('.anchor'));
const panels  = Array.from(document.querySelectorAll('.panel'));
const views   = Array.from(document.querySelectorAll('.view'));

const ambient = document.querySelector('.ambient');
const GROUND = ['#FDFBF6', '#CC3B2A', '#FDFBF6', '#CC3B2A'];
const GOLD_VIEWS = [1, 3];
const themeColor = document.querySelector('meta[name="theme-color"]');

let current = -1;

/* One function drives everything, from one index. */
function setActive(i) {
  if (i === current || i < 0 || i >= views.length) return;
  current = i;

  /* panels and views 0..i are drawn down; everything above is clipped
     away. The pair share one edge, so a view's ground and its type
     arrive as a single curtain. */
  panels.forEach((p, n) => p.classList.toggle('is-on', n <= i));
  views.forEach((v, n) => {
    v.classList.toggle('is-on', n <= i);
    v.classList.toggle('is-top', n === i);
    /* keep Tab and screen readers inside the view on show */
    v.toggleAttribute('inert', n !== i);
    v.setAttribute('aria-hidden', n !== i ? 'true' : 'false');
  });

  /* a view's contents reveal as it arrives — an observer is no use
     here, because all four are stacked and every one of them counts
     as on screen from the start */
  views[i].querySelectorAll('.rv').forEach((el) => el.classList.add('in'));

  /* embers and butterflies are one shared layer floating above every
     panel, so they cannot inherit a view's tokens — they are told which
     palette they are currently flying over */
  if (ambient) ambient.classList.toggle('theme-red', GOLD_VIEWS.includes(i));

  /* the ground drifts up as the next panel covers it: the parallax
     that stops the cover from reading as a flat mask */
  root.style.setProperty('--plate-shift', -Math.min(i * 26, 78) + 'px');
  root.style.setProperty('--progress', (i / (views.length - 1)).toFixed(4));
  root.dataset.view = String(i);
  if (themeColor) themeColor.setAttribute('content', GROUND[i]);

  history.replaceState(null, '', '#' + anchors[i].id);
}

/* ───────────── too short to stack ─────────────
   Below this height a view cannot hold its own content, so the stacked
   model is abandoned for a plain scrolling page (`html.flow` in the
   CSS). Never by giving a view `overflow-y: auto`: a fixed, full
   viewport scroll container whose content happens to fit swallows the
   gesture instead of chaining it out, which freezes the whole page. */

const tooShort = window.matchMedia('(max-height: 620px)');

function applyMode() {
  const flow = tooShort.matches;
  root.classList.toggle('flow', flow);
  if (flow) {
    document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
    views.forEach((v) => { v.removeAttribute('inert'); v.removeAttribute('aria-hidden'); });
  } else {
    const at = Math.max(0, current);
    current = -1;                       /* force the stacked state to redraw */
    setActive(at);
  }
}
tooShort.addEventListener('change', applyMode);

/* the anchors are hidden in flowing mode, so #hash links must be sent to
   the view itself instead */
document.addEventListener('click', (e) => {
  if (!root.classList.contains('flow')) return;
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const i = anchors.findIndex((an) => '#' + an.id === a.getAttribute('href'));
  if (i < 0) return;
  e.preventDefault();
  views[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  history.replaceState(null, '', '#' + anchors[i].id);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) setActive(anchors.indexOf(e.target));
  });
}, { threshold: 0.55 });
anchors.forEach((a) => io.observe(a));

/* ───────────── paging by keyboard ───────────── */

function page(step) {
  if (root.classList.contains('flow')) return;   /* the page scrolls natively */
  const next = Math.max(0, Math.min(anchors.length - 1, current + step));
  if (next !== current) {
    anchors[next].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
}

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  const step = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key];
  if (step !== undefined) { e.preventDefault(); page(step); }
  else if (e.key === ' ') { e.preventDefault(); page(e.shiftKey ? -1 : 1); }
  else if (e.key === 'Home') { e.preventDefault(); anchors[0].scrollIntoView(); }
  else if (e.key === 'End') { e.preventDefault(); anchors[anchors.length - 1].scrollIntoView(); }
});

/* ───────────── start ─────────────
   The in-view links are plain #hash anchors, so the browser's own
   smooth scrolling handles them and the snap catches the landing. */

if (reduced) document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));

const start = anchors.findIndex((a) => '#' + a.id === location.hash);
setActive(start < 0 ? 0 : start);
applyMode();
if (start > 0) (tooShort.matches ? views[start] : anchors[start]).scrollIntoView();
