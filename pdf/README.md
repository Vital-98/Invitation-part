# The print card

A one-page A4 version of the invitation, in Marathi and English, set inside the
supplied gold-and-navy frame.

```
./build.sh          # → invitation-mr.pdf, invitation-en.pdf
./build.sh png      # → the same, plus preview-*.png
```

Needs `google-chrome` on PATH; nothing else.

| file | what it is |
| --- | --- |
| `invitation-mr.html` / `invitation-en.html` | the two cards — content only, no shared markup |
| `card.css` | all of the design; `.en` at the foot is the Latin cut |
| `frame.jpg` | the supplied border art, used as a full-bleed background |
| `fonts/fonts.css` | Rozha One, Tiro Devanagari Marathi, Eczar and Mukta, base64-inlined |

## Why it is built this way

**The fonts are inlined.** The card has to render the same on any machine, and a
`file://` page cannot reliably fetch webfonts. The devanagari, latin and
latin-ext subsets are base64'd into `fonts/fonts.css`; the greek and cyrillic
ones are dropped. Chrome subsets them again on the way into the PDF, so the
1.4 MB stylesheet becomes ~150 KB of embedded font per card.

**The safe box is measured, not guessed.** `frame.jpg` is not a plain rectangle —
its floral cluster reaches down to y=15% on the top-left and climbs to y=81% at
x=80% on the bottom-right. The type lives at 18%–82% across and 15.4%–86.8%
down, which is clear of both. The sender line is capped at 92mm so the lowest
row stays inside the 72% column, well away from the lower spray. Move any of
these and check the corners again.

**Colours are sampled from the frame** — navy `#1B3353`, gold `#BA9762` — so the
type reads as part of the border rather than something laid on top of it.

**Devanagari is never letter-spaced.** Tracking splits the akshara: at 0.22em
`दिनांक` sets as `दि नां क`. The base sheet keeps tracking at 0.02em and only
`.en` opens the small gold labels out to 0.22em, where Latin wants it.

## Changing the wording

The text is the same content as the web invitation, and lives directly in the
two HTML files — there is no template step. Edit and re-run `build.sh`.
