# GodwinShop Client

React (Vite) frontend for GodwinShop — a full-stack e-commerce platform. Dark/light themed, mobile-friendly storefront plus complete admin panel.

## Tech stack

- React 18 + React Router
- Tailwind CSS (dark/light themes)
- Vite 5
- Lucide icons
- Axios (session-cookie auth)

## Development

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api & /uploads to backend on :5000)
```

## Production build

```bash
npm run build      # outputs to dist/
```

Set `VITE_API_URL` (see `.env.example`) to the deployed backend, e.g. `https://your-api.onrender.com/api`, then serve `dist/` from any static host (or Render static site).

## Scripts

| Script          | Action                                  |
| --------------- | --------------------------------------- |
| `npm run dev`   | Vite dev server with backend proxy      |
| `npm run build` | Production build to `dist/`             |
| `npm run preview` | Preview the production build         |

## Structure

```
src/
├── api/         # Axios instance + base URL
├── components/  # Reusable UI (ProductCard, Modal, Spinner, ...)
├── context/     # Auth, Cart, Theme, Toast
├── hooks/       # useApi, useDebounce, useDocumentTitle, ...
├── layouts/     # Navbar, Footer, MainLayout, AdminLayout
├── pages/       # Storefront + admin pages
└── utils/       # format helpers, constants
```

## License

Private project — all rights reserved.