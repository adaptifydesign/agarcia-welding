# A.Garcia Welding

Marketing site for A.Garcia Welding — custom wrought iron gates, fences, railings and
furniture serving Temecula Valley and Riverside County, California.

Static single-page site built with Bootstrap 4 and Sass, compiled by Gulp.

## Getting started

```bash
npm install
npm start
```

`npm start` builds the site and serves it at http://localhost:3000 with BrowserSync,
rebuilding whenever `scss/` or `js/` changes.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Build, then watch and serve on port 3000 |
| `npm run build` | One-off build: copy vendor files, compile CSS and JS |
| `npm run clean` | Remove the generated `vendor/` directory |

## Layout

```
index.html      The whole site — one page, anchored sections
scss/           Sass sources; agarcia-welding.scss is the entry point
js/             agarcia-welding.js is the source, .min.js is generated
css/            Generated — do not edit by hand
vendor/         Generated — copied from node_modules by `gulp vendor`
img/            Photography and SVG icons; img/gallery/ feeds the gallery
robots.txt      Points crawlers at the sitemap
sitemap.xml     Single-URL sitemap
```

Anything in `css/`, `vendor/`, and `js/*.min.js` is build output. Edit the Sass and the
unminified JS instead, and let `npm run build` regenerate the rest.

## Adding a gallery photo

1. Drop the image into the matching `img/gallery/<category>/` folder. Folder names are
   lowercase and must stay that way — the site is served from case-sensitive hosts.
2. Add an `<a class="images" href="..." data-lity data-class="<category>">` block inside
   `.gallery-container` in `index.html`, matching an existing entry.
3. Give the `<img>` real `width`/`height` attributes and alt text that describes the
   piece. Alt text is what image search reads, so avoid repeating the same keywords.

The `data-class` value must match a filter button's `data-class` for the photo to appear
under that category.

## SEO notes

The page carries a canonical URL, Open Graph and Twitter card tags, and
`HomeAndConstructionBusiness` JSON-LD covering the phone number, email, service list and
service area. If the business name, phone, email, or service area changes, update it in
**both** the visible markup and the JSON-LD block so the two stay consistent — search
engines treat a mismatch as a low-trust signal.
