# Partly handoff

## Current state

Partly is a Node.js full-stack MVP for searching Bangladesh computer parts. It serves a responsive frontend and a backend API from the same process.

## Run without a proxy

1. Copy `.env.example` to `.env.local`, or leave `.env.local` absent.
2. Make sure `PARTLY_PROXY`, `PARTLY_PROXY_USER`, and `PARTLY_PROXY_PASSWORD` are unset.
3. Run `npm start`.
4. Open `http://localhost:3000`.

When no `PARTLY_PROXY` is set, the backend uses its normal outbound `fetch` path. The current local `.env.local` is intentionally excluded from the handoff archive because it contains development proxy credentials.

## Search flow

The user searches for a part such as `ddr4 ram`, then presses Search or Enter. The frontend calls `GET /api/search?q=ddr4%20ram`. The backend tries public retailer/search pages for Star Tech and Ryans, extracts product title, structured price, specifications, source URL, and `og:image`, and then combines live results with the indexed fallback catalog.

If live retailer requests fail, the app returns matching seeded Bangladesh catalog results and explains that fallback is being used.

## Important endpoints

- `GET /api/health`
- `GET /api/stats`
- `GET /api/products?...`
- `GET /api/search?q=...`
- `POST /api/watchlist`
- `DELETE /api/watchlist?productId=...`
- `GET /opensearch.xml`

## Production next steps

- Replace the in-memory catalog with a persistent database.
- Add retailer-specific adapters with rate limits and caching.
- Review each retailer’s terms and robots rules before scaling collection.
- Add a corporate CA bundle or standard cloud egress if a corporate proxy is required.
- Store proxy credentials only in the deployment secret manager, never in Git.
