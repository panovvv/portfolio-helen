# Portfolio Helen

Professional photography portfolio for Elena Panova — product and food photographer based in Porto, Portugal.

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3, TypeScript)
- **UI**: Nuxt UI 3 + Tailwind CSS 4
- **Images**: @nuxt/image (Vercel provider in production, IPX locally)
- **i18n**: @nuxtjs/i18n (English + Russian, `no_prefix` strategy)
- **Lightbox**: GLightbox
- **Icons**: FontAwesome (vue-fontawesome)
- **Formatting**: Prettier (`npm run prettier`)

## Project Structure

```
app/
  assets/
    css/main.css              # Tailwind + Nuxt UI imports
    gallery_metadata.json     # Portfolio image metadata (filename, alt key, tags)
  components/
    FadePreloadImg.vue        # Dual-buffer crossfade image component
    Gallery.vue               # GLightbox wrapper with responsive grid + hash navigation
    NavBar.vue                # Sticky navbar with theme/language toggles
  layouts/default.vue         # Main layout with cookie notice
  pages/
    index.vue                 # Home page with rotating carousel (3 columns)
    portfolio.vue             # Tag-filtered gallery (main portfolio)
    lifestyle.vue             # 4-section lifestyle gallery (hardcoded file lists)
    types.vue                 # Photography types showcase
    about.vue                 # About page
    contact.vue               # Contact info
i18n/
  vue-i18n.config.ts          # All translations (en + ru)
types/
  Gallery.ts                  # GalleryImage, LightboxDescription interfaces
public/
  gallery/                    # Portfolio images (10 folders: 01-skin-care through 10-creative)
  lifestyle-001/ to 004/      # Lifestyle images
```

## Key Conventions

### Gallery Metadata

`gallery_metadata.json` drives both the portfolio page and the home page carousel. Each entry:

```json
{
  "filename": "01-skin-care/01.jpg",
  "alt": "gallery.alt.skin_care.01",
  "tags": ["skin_care"]
}
```

- `filename`: path relative to `/public/gallery/`
- `alt`: i18n key prefix; code appends `.title` and `.description`
- `tags`: array of tag IDs for filtering

### Portfolio Tags

Tags and their display order are defined in `portfolio.vue` as `TAG_ORDER`. Tag labels come from `gallery.tags.{tag_id}` in i18n. Current tags (in order):

`skin_care`, `makeup`, `casmara_tonic`, `casmara_eye`, `collagen`, `anti_age`, `packaging`, `food`, `outdoor`, `creative`

### Image Naming

Gallery folders use `{NN}-{slug}/` format (e.g. `01-skin-care/`). Files within are `01.jpg`, `02.jpg`, etc. The number prefix on folders determines tag display order.

### i18n Structure

All translations live in `i18n/vue-i18n.config.ts`. Gallery-related keys:

- `gallery.tags.{tag_id}` — tag button labels
- `gallery.alt.{tag_id}.{NN}.title` — image title
- `gallery.alt.{tag_id}.{NN}.description` — image description
- `gallery.lightbox.seeMore` — lightbox expand button

Lifestyle sections: `lifestyle.sections.{id}.title`

### Where Gallery Images Are Referenced

When replacing or renaming gallery images, update **all** of these locations:

1. **`app/assets/gallery_metadata.json`** — master list for portfolio page + home carousel
2. **`app/pages/index.vue`** — `CAROUSEL_IMAGES` array: curated subset shown in the home page carousel
3. **`app/pages/types.vue`** — `images` array: one image per shoot type (10 hardcoded paths)
4. **`app/pages/lifestyle.vue`** — `IMAGE_SOURCES_PER_SECTION`: hardcoded lifestyle image lists (separate from gallery)
5. **`i18n/vue-i18n.config.ts`** — `gallery.alt.{tag}.{NN}` keys for image titles/descriptions

### Home Page Carousel

`index.vue` has a `CAROUSEL_IMAGES` array — a curated list of gallery filenames. Only these images appear in the rotating carousel (1-3 columns, responsive). Uses `FadePreloadImg` for smooth crossfades with a non-repeating pool.

### Lightbox Hash Navigation

Gallery component writes `#glb={galleryId}:{slideIndex}` to the URL. On page load, if a hash is present, the lightbox auto-opens to that slide. This allows direct linking to specific images.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run prettier   # Format all files
```

## Deployment

Deployed on Vercel. Image optimization uses Vercel's image CDN in production (detected via `VERCEL=1` env var), falls back to IPX for local dev.

## Styling

- Tailwind utility classes throughout
- Primary color: lime (configured in `app.config.ts`)
- Dark mode supported via Nuxt UI's `useColorMode`
- No SCSS or external CSS files beyond `main.css`

## Adding New Gallery Categories

1. Add folder under `public/gallery/` following `{NN}-{slug}/` naming
2. Add numbered `.jpg` files inside (`01.jpg`, `02.jpg`, ...)
3. Add entries to `gallery_metadata.json` with the new tag
4. Add the tag to `TAG_ORDER` in `portfolio.vue` (position = display order)
5. Add tag label to `gallery.tags.{tag}` in both EN and RU in `vue-i18n.config.ts`
6. Add per-image alt text under `gallery.alt.{tag}.{NN}` in both locales
