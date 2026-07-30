# MySports
Sports score and live updates app

## Step 1: prove live score fetching works

A Vite + React app that fetches live scoreboards directly from ESPN's public
site API for NFL, NBA, MLB, NHL, and Premier League, and renders the raw
parsed results (team names, score, status, start time) in an unstyled list.
No backend proxy yet — this is just to confirm the data comes through (or to
see the exact CORS error if it doesn't).

### Prerequisites (Ubuntu)

Check if Node.js and npm are already installed:

```bash
node -v
npm -v
```

You need Node 18+ (20 or 22 LTS recommended). If they're missing or too old,
install Node via NodeSource (gives you an up-to-date Node + npm together):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # verify
npm -v
```

### Install & run

```bash
npm install
npm run dev
```

Vite will print a local URL (default `http://localhost:5173`). Open it in a
browser and open devtools console — the app fetches all 5 sports on load and
lists whatever comes back. Any fetch failure (e.g. CORS) is logged to the
console with the full error and also shown inline for that sport.

Other scripts: `npm run build` (production build), `npm run preview` (serve
the build), `npm run lint` (oxlint).
