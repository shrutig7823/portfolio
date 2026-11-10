# Shruti Gaikwad: portfolio

A one-page portfolio in plain HTML, CSS and a little JavaScript. No framework and no build step, so Vercel serves it as it is. Dark, techy look with motion.

## What is on it
- **Projects I built:** Homli (live) and the aptitude game (in progress).
- **Case studies, PRDs and assignments:** nine PDFs with a thumbnail and a short summary each.
- **How I work, internships, education and contact.**

## Files
| File | Job |
|---|---|
| `index.html` | The whole page |
| `styles.css` | The look. Colours, spacing and fonts are tokens at the top |
| `main.js` | The motion: typed terminal, moving network background, scroll reveals, counters, card tilt and spotlight |
| `vercel.json` | Security headers and long caching for `assets/` |
| `assets/decks/` | The nine PDFs |
| `assets/img/` | A cover thumbnail for each PDF |

## Run it on your laptop
```
python -m http.server 8126
```
Open http://localhost:8126

## Motion
Everything animated lives in `main.js` and the `@keyframes` at the bottom of `styles.css`. For visitors who set "reduce motion" in their system, the animations are switched off and the page is static. Without JavaScript the page still shows all its content.

## Change something
- **Text:** edit `index.html`.
- **A project card:** copy an existing `<article class="card">`, change the text, add the PDF to `assets/decks/` and a thumbnail to `assets/img/`.
- **Colours:** change the tokens at the top of `styles.css`.
- **Terminal text:** edit the `data-lines` list on the terminal in `index.html`.
- **Skills strip:** edit the `<span>` list in the `marquee` section of `index.html`.
- **Numbers at the top:** the `data-count` values in `index.html`. Keep them true.

## Deploy on Vercel
1. Put this folder in a GitHub repository (the repository's root should contain `index.html`).
2. On vercel.com, choose Add New, then Project, and import the repository.
3. Framework Preset: **Other**. Leave the build command and output directory empty. Deploy.
Every push to `main` then redeploys the site automatically.

## Honest notes
- Homli's page says it was built with an AI assistant, and it says what is and is not validated. Keep that wording true if you edit it.
- Case study PDFs are the author's own submissions. Product Space and Instagram figures marked "illustrative" in the decks are assumptions, not data.
