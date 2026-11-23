# Manas Shende — Portfolio

Personal portfolio of [Manas Shende](https://github.com/manas-08), an AI/ML engineer. The site is typeset as a research paper: abstract, numbered sections, citations, tables, and interactive figures.

**Live:** deploy from this repo on [Vercel](https://vercel.com/new), then set the GitHub About website to the deployment URL.

## Concept

The page is titled *On Building Machines That Show Their Work*. Projects are reported as experiments, skills as methods, and contact as correspondence. The visual language is ink on paper (light) and chalk on board (dark), not a generic dark neon AI landing page.

## Features

- **3D brain hero** — point-cloud volume built with React Three Fiber and a custom shader. Cursor proximity labels points with BraTS-style classes (edema, enhancing tumor, necrotic core); an axial scan plane sweeps the volume.
- **Interactive figures**
  - Retrieval pipeline trace for the multi-document RAG assistant
  - MRI / Grad-CAM++ schematic for the brain tumor segmentation project
  - Animated Airflow DAG with simulated retries for the weather ETL pipeline
- **Paper chrome** — drop caps, booktabs tables, `[n]` citations with hover previews, handwritten margin notes, sticky table of contents
- **Ink / chalk theme** — light and dark modes via `next-themes`, with a system default
- **Live GitHub data** — public repos and language stats from the GitHub API, revalidated daily; Word of the Day from [`word_of_the_day`](https://github.com/manas-08/word_of_the_day)
- **Print-friendly** — grain, chrome, and UI chrome hide when printing

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| 3D | Three.js, `@react-three/fiber` |
| Motion | Framer Motion |
| Theme | `next-themes` |
| Language | TypeScript |

## Project layout

```text
app/
  layout.tsx          # fonts, metadata, theme provider
  page.tsx            # the paper (all sections)
  globals.css         # design tokens, paper grain, print rules
components/
  brain/              # WebGL point-cloud figure
  figures/            # RAG, Grad-CAM++, Airflow demos
  masthead.tsx        # sticky header + word of the day
  paper.tsx           # Section, Cite, Marginalia
  section-rail.tsx    # sticky contents + reading progress
  theme.tsx           # ink / chalk toggle
lib/
  content.ts          # résumé-backed copy (edit here)
  github.ts           # GitHub + word-of-the-day fetchers
public/
  manas-shende-resume.pdf
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint    # ESLint
```

## License

Personal portfolio. All rights reserved unless noted otherwise in individual dependencies.
