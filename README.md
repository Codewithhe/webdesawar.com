# Mini Desawar Frontend

Production-ready Next.js frontend for live Satta result data from the existing backend API.

## Stack

- Next.js App Router
- TypeScript
- Server-rendered data fetching with a 60-second client refresh on the home page

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_API_BASE_URL=https://scrapper-test-ten.vercel.app
```

Optional:

- `NEXT_PUBLIC_SITE_URL` for canonical URLs and SEO metadata
- `CATEGORY_NAME` to choose the featured Mini Desawar card from API shift names

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Import the repository into Vercel.
2. Set `NEXT_PUBLIC_API_BASE_URL` in project environment variables.
3. Deploy with the default Next.js settings.

The frontend only consumes `GET /api/latest` from your API base URL. It does not scrape external sites or call scrape endpoints from the public website.

## Pages

- `/` home dashboard with Today, Recent, and Week sections
- `/month-chart` full weekly chart
- `/results` searchable results table
