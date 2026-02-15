# RMS App — Frontend

Vite + React frontend for the Restaurant Management App.

## Setup

```bash
npm install
npm run dev
```

Runs at **http://localhost:5174**

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Structure

```
src/
├── components/
│   ├── layout/     # AppLayout, Sidebar, Header
│   └── ui/         # Button, Card, Badge
├── config/         # constants, routes, status maps
├── lib/            # api client (placeholder for backend)
├── pages/          # Dashboard, Menu, Tables, Orders, Kitchen
├── App.jsx
├── main.jsx
└── index.css
```

## Environment

- `VITE_API_URL` — Backend API base URL (e.g. `http://localhost:3000/api`). Optional until backend exists.
