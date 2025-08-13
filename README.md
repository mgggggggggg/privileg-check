# Privileg‑Check (React + Vite + Tailwind)

Schlanke, anonyme Web‑App für die Community‑Übung „Privileg‑Check“.
- Keine Accounts, keine IPs/UA/Timestamps.
- Jede Abgabe wird gespeichert (lokal im Browser) und fließt in die Grafik ein.
- Gleicher Browser (inkl. mehrere Tabs): Update desselben Punkts.
- Neuer/Inkognito‑Browser: neuer Punkt.
- Rate‑Limit: max. 10 Updates pro Minute.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne die URL aus der Konsole (typisch http://localhost:5173).

## Deployment auf GitHub Pages

1. Dieses Repo auf GitHub erstellen und Code pushen.
2. Datei `vite.config.js` prüfen: `base` muss auf den **Repo‑Namen** passen (z. B. `/privileg-check/`).
3. In GitHub → **Settings → Pages**: Source = **GitHub Actions**.
4. Der mitgelieferte Workflow unter `.github/workflows/deploy.yml` baut & deployed automatisch bei Push auf `main`.
5. Die Seite ist nach erfolgreichem Workflow unter `https://<username>.github.io/<repo>/` erreichbar.

## Dateien

- `src/App.jsx` – gesamte App
- `src/main.jsx` – React‑Mount
- `src/index.css` – Tailwind
- `vite.config.js` – Basis‑Pfad für Pages
- `.github/workflows/deploy.yml` – CI zum Veröffentlichen

## Hinweise

- Für den öffentlichen Start sind die Teilnahmen auf **0** gesetzt (kein Demo‑Seed).
- Tailwind wird bereits eingebunden. Anpassungen am Farbschema jederzeit möglich.
