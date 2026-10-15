# Partly development context export

This is an importable summary of the work completed so far.

## Product goal

Build a Bangladesh-only PC parts search engine. A user searches for a part such as `ddr4 ram`; the app searches Bangladesh retailers and search sources, then presents retailer listings with name, price, source link, image, and specifications.

## Implemented

- Responsive Partly frontend with search, category filters, price range, availability, warranty, compare state, price trend panel, and build starter panel.
- Node.js server with no required third-party packages.
- Dynamic catalog API and health endpoint.
- Browser OpenSearch integration via `/opensearch.xml` and `/search?q=...`.
- Live-search adapter for Star Tech and Ryans through backend requests.
- Product metadata extraction from JSON-LD and Open Graph image metadata.
- Source links from result cards.
- Fallback Bangladesh catalog entries, including DDR4 RAM examples.
- Optional development-only proxy support through `PARTLY_PROXY`, `PARTLY_PROXY_USER`, and `PARTLY_PROXY_PASSWORD`.

## Proxy decision

The proxy was configured only for Partly development, not Windows globally. The local proxy file is excluded from the handoff archive. The receiving environment should run without proxy variables first; only add them if that environment requires a proxy.

## Known limitation

The current Fortinet proxy path failed HTTPS/TLS negotiation for the Node/cURL backend with `SEC_E_NO_CREDENTIALS`, so live retailer requests fell back to the indexed catalog. This is environmental, not a frontend search bug.

## Files

- `server.js` — backend, API, live search, static server
- `app.js` — frontend state and API integration
- `index.html` — application markup
- `styles.css` — visual design and responsive layout
- `package.json` — start scripts
- `README.md` — setup and deployment notes
- `HANDOFF.md` — technical migration notes
- `opensearch.xml` — browser search-engine descriptor
