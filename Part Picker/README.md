# Partly — Bangladesh PC Parts Search

A publishable full-stack MVP for searching and comparing computer parts sold in Bangladesh.

## Search workflow

1. Enter a query such as `ddr4 ram` and press Search or Enter.
2. The backend searches public retailer pages through a server-side search adapter for Star Tech and Ryans.
3. It opens the best retailer pages and extracts product title, price from structured product data, specifications, and `og:image` when published by the retailer.
4. Results render as source-linked cards in Partly. If a site blocks a request or times out, matching indexed Bangladesh catalog records are shown instead.

The app uses a backend adapter instead of browser-side scraping so retailer pages do not need to enable cross-origin requests. Retailer terms, robots rules, rate limits, and permission should be reviewed before operating this at scale.

## Run locally

Requires Node.js 18+.

### Development proxy

Partly can route only its outbound retailer/search requests through a development proxy. Put the proxy in `.env.local` as `PARTLY_PROXY=http://alpha:8080`. This does not change Windows proxy settings and does not proxy the browser or other applications. `.env.local` is ignored by Git.

```bash
npm start
```

Open http://localhost:3000.

For development with automatic restarts:

```bash
npm run dev
```

## Included API

- `GET /api/health` — deployment health check
- `GET /api/stats` — marketplace summary
- `GET /api/products?q=RTX&category=GPU&maxPrice=100000&stock=true&sort=price-low` — dynamic search
- `POST /api/watchlist` with `{ "productId": 1 }` — save a product
- `DELETE /api/watchlist?productId=1` — remove a product
- `GET /opensearch.xml` — browser search-engine descriptor
- `GET /search?q=RTX+5070` — OpenSearch-compatible search URL

## Add Partly as a browser search engine

Open `http://localhost:3000/opensearch.xml` in a browser that supports OpenSearch, or visit the app and use the browser's "Add search engine" action. The browser will then send searches to `/search?q=...`, which redirects into the app with the query loaded.

The included catalog is seed data for the MVP. In production, replace the in-memory `products` array in `server.js` with a database and retailer ingestion jobs.

## Deploy

This project needs no build step. On Render, Railway, Fly.io, or a VPS, use:

- Build command: leave blank
- Start command: `npm start`
- Environment variable: `PORT` is supplied by most hosts automatically

Before a public launch, connect a persistent database, add retailer permission/rate-limit controls, and label prices as indicative where retailer checkout can change them.
