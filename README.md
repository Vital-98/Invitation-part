# गणपती आमंत्रण — Satyanarayan Puja & Mahaprasad

A mobile-first invitation site: four full-screen views that snap into place
as you scroll, over a fixed ambient stage. Views 1–2 are ivory with
vermilion type; from view 3 the page flips to vermilion with gold type.

```
index.html     markup, the idol plate, the drawn fallback
styles.css     design tokens, layout, reveal system, keyframes
app.js         plate hand-off, butterflies, scroll ambience, glide scroll
idol.jpeg      the background photograph
assets/video/  optional: drop idol.mp4 / idol.webm here
assets/*.png   the butterfly, the Ganesha mark and the closing glyph, as alpha masks
```

## The four views

1. **स्वागत** — the idol photograph, title, date pill, the Ganesha mark as the down cue
2. **आमंत्रण** — the invitation text
3. **तपशील** — date, time, place, the map button *(theme flips to red here)*
4. **समारोप** — the Ganesha glyph, श्री गणेश, the blessing with diyas

Snapping is `scroll-snap-type: y mandatory` on `html`; each view is
`100svh` with `scroll-snap-align: start`. The view holding the centre of the
screen gets `.is-active` (an `IntersectionObserver` at 0.55), the others
sit back at 35 % opacity, and `html.theme-red` is set from view 3 on — every
colour in the stylesheet is a token that the theme swaps, and the flip
itself is a 1 s transition. On viewports under 700 px tall, snapping is
turned off and the page flows normally so nothing is clipped.

## Run it

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173> — narrow the window, or use the browser's
device toolbar at 390 × 844, to see it as intended.

## Palette and type

Accent is the supplied vermilion **#EB4E40**, with a ladder derived from it
so every use clears contrast on ivory:

| token            | hex       | use                                      |
|------------------|-----------|------------------------------------------|
| `--accent`       | `#EB4E40` | display type, rules, bells, butterflies  |
| `--accent-deep`  | `#CC3B2A` | borders, icons, the solid button         |
| `--accent-text`  | `#A82C1E` | small text (6.7:1 on ivory)              |
| `--accent-dark`  | `#8F2416` | hover, bell clappers                     |

Type: **Rozha One** for the display moments (title, salutation, blessing) —
chosen after testing: Yatra One cannot shape त्र, प्र or श्री correctly; **Eczar** for prose
and values; **Mukta** for the small uppercase labels.

## How the photograph sits in the page

`idol.jpeg` is shown at its own colour. It is faded with opacity, not
recoloured, and dissolved at the edges by a radial `mask-image` so it never
reads as a rectangle; the static veil then turns solid ivory by the time the
title begins, so the type always sits on a clean ground.

```css
--photo-opacity: 0.9;
--photo-filter: saturate(1.02) brightness(1.03);
--plate-top: 46%;     /* framing: lifted so the crown and face hold the frame */
--plate-scale: 1.2;   /* scaled in so the busy top of the photo falls outside */
```

The mask is stated in the element's own box, so it stays centred on the
idol after that scale. If you swap in a different photo, re-check the two
framing values first — they are cropped for this particular shot.

## Bells

Two temple bells hang from the top edge of the welcome screen on dashed
chains and swing gently from their pivots (different periods, so they never
sync). A small bell ends the drop line under each section label. They are
inline SVG, coloured from the palette tokens, and hold still under
`prefers-reduced-motion`.

## Adding a video later

Put a clip at `assets/video/idol.mp4` (and `idol.webm` if you have it) and
it takes over from the photograph the moment it is actually playing — the
photo fades out beneath it. It sits the same way, through
`--video-opacity` and `--video-filter`.

The clip should be **portrait**, a **seamless loop**, and ideally under
~6 MB so it starts quickly on mobile data. A slow, near-still shot works
best — the page supplies the motion around it.

## Still to fill in

- **Google Maps pin** — `MAP_URL` at the top of `app.js`. It currently falls
  back to a maps search for the address, which works but does not pin the
  house exactly.
