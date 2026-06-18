# CyberPulse 🛡️

**Real-Time Threat Intelligence Platform**

CyberPulse is a client-side cybersecurity intelligence dashboard that aggregates news, vulnerability data, breach reports, and community discussions into a single, live command centre. It runs entirely in the browser — no backend server required.

---

## ✨ Features

### 📰 News Aggregation (Main Page)

The main page compiles **all available articles** from 21+ security-focused RSS feeds, sorted chronologically. Each feed requests up to 50 items, providing broad coverage across the security landscape. Articles are displayed in a responsive card grid and can be filtered by category.

**Category filters:**
`All` · `Vulnerability` · `Tooling` · `Breach` · `Security` · `Research` · `Investigation` · `Global` · `Industry` · `Enterprise`

Cards expand in-place on click to show full descriptions and a direct link to the original article.

### 🔍 CVE-Centric Search ("Discovery View")

The search system is designed around **CVE-first intelligence gathering**. When a user searches for a product or keyword (e.g. "Apache", "Chrome", "Ransomware"):

1. **NVD Query** — The app queries the NIST National Vulnerability Database (NVD API 2.0) for CVEs matching the search term, defaulting to the last **3 months**.
2. **CVE Cross-Reference** — The CVE IDs returned by NVD are extracted and cross-referenced against cached news article titles and descriptions. This surfaces articles that mention specific CVE IDs even if they don't contain the original search keyword.
3. **News Filter** — All cached news articles from the last **3 months** are also searched by keyword match (title, description, source).
4. **Breach Filter** — Breach reports are filtered by both the keyword and any discovered CVE IDs.
5. **CVE Deduplication** — Local (already-cached) CVE results and live NVD results are merged and deduplicated by ID.

The Discovery View presents an **Intelligence Summary** with counts across all data types, followed by sectioned results:
- **Related Security News** — Matching articles displayed as expandable news cards
- **Vulnerabilities (CVEs)** — Tabular view with CVE ID, severity badge (Critical/High/Medium/Low), description, and publication date
- **Data Breaches & Leaks** — Matching breach reports

The CVE section includes a **timeframe selector** so users can adjust the window after initial results load:
`Last 3 Months` · `Last 6 Months` · `Last 12 Months` · `All Time (Newest)` · `All Time (Oldest)`

### 📡 Threat Briefings Sidebar (Left)

A collapsible left sidebar with expandable dropdown panels for **27 intelligence sources**, organised into three groups:

**News Outlets (13)**
The Hacker News · BleepingComputer · Dark Reading · CyberScoop · SecurityWeek · Krebs on Security · The Record · Help Net Security · SC Media · Sophos News · HackRead · Securelist (Kaspersky) · CSO Online

**Security Tooling (10)**
CrowdStrike · Tenable · Splunk Security · SpecterOps (BloodHound) · Velociraptor · Rapid7 · Huntress Research · SentinelLabs (S1) · Mandiant Intelligence · Microsoft Security

**Government & Standards (3)**
ACSC Advisories (AU) · NIST CSRC News · CISA Alerts (US)

Each panel loads the latest 3 articles on-demand when expanded, with direct links to the source site.

### 🧠 System Intelligence Sidebar (Right)

A collapsible right sidebar with four live sections:

| Section | Description |
|---|---|
| **Reddit Community Intel** | Live subreddit feeds with tab switching: `r/netsec`, `r/cybersecurity`, `r/hacking`, `r/Malware`, `r/AskNetsec`, `r/darkweb`, `r/ReverseEngineering` |
| **Top 10 Critical CVEs** | Highest-scored CVEs from the last 30 days (CVSS 7.0+), pulled from NVD |
| **Latest CVE Stream** | Most recently published CVEs, sorted by date |
| **Data Breach Tracker** | Recent breach and leak reports from dedicated breach feeds (last 30 days) |

### 📱 Progressive Web App (PWA)

CyberPulse is a fully installable PWA with:
- **Service Worker** — Network-first caching for core assets (HTML, CSS, JS), cache-fallback for offline access
- **Web App Manifest** — Standalone display mode, custom theme colour (`#00ff9d`), 192px and 512px icons
- **Install Prompt** — An in-app "Install App" button appears when the browser supports PWA installation

### 🎨 Design

- **Dark mode** with neon green (`#00ff9d`) and cyan (`#00d4ff`) accent palette
- **Glassmorphism** — Frosted glass header with `backdrop-filter: blur(15px)`
- **Typography** — [Outfit](https://fonts.google.com/specimen/Outfit) for body text, [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for monospaced elements (CVE IDs, status labels)
- **Micro-animations** — Pulse icon animation, skeleton loading states, hover transforms, smooth section collapse/expand
- **Three-column responsive layout** — Collapsible sidebars with floating expand buttons
- **Noise filtering** — General tech articles (gaming, smartphones, streaming) are automatically filtered out from security feeds

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌───────────┐ │
│  │ index.html│    │ style.css │    │  main.js  │    │   sw.js   │ │
│  │ (Layout) │    │ (Design) │    │  (Logic)  │    │ (Caching) │ │
│  └──────────┘    └──────────┘    └─────┬─────┘    └───────────┘ │
│                                        │                         │
│                          ┌─────────────┼──────────────┐          │
│                          │             │              │          │
│                          ▼             ▼              ▼          │
│                   ┌────────────┐ ┌──────────┐ ┌────────────┐    │
│                   │ rss2json   │ │ NVD API  │ │ Reddit RSS │    │
│                   │ (RSS Proxy)│ │  (CVEs)  │ │  (via r2j) │    │
│                   └────────────┘ └──────────┘ └────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

**Data flow:**
1. **RSS Feeds** — Fetched via `api.rss2json.com` to bypass CORS. Each feed requests up to 50 items (`&count=50`).
2. **NVD API 2.0** — Queried directly for CVE data. The main dashboard fetches CVEs from the last 14 days (up to 250 results). Search queries use keyword-based lookups with client-side date filtering.
3. **Reddit** — Subreddit RSS feeds are also fetched via rss2json, cached in-memory for 5 minutes.
4. **All data is stored in-memory** (`allNews`, `allBreaches`, `allCVEs`) and re-fetched every 15 minutes.

---

## 📁 Project Structure

```
CyberPulse/
├── index.html            # Main HTML — three-column layout, sidebar panels, category filters
├── main.js               # Application logic — data fetching, rendering, search, CVE analysis
├── style.css             # Full design system — CSS variables, grid, animations, responsive breakpoints
├── sw.js                 # Service Worker — network-first caching strategy
├── manifest.json         # PWA manifest — app name, icons, theme, display mode
├── icon-192.png          # PWA icon (192×192)
├── icon-512.png          # PWA icon (512×512)
├── run_cyberpulse.bat    # Windows launcher — starts Python HTTP server on port 8085
└── README.md             # This file
```

---

## 🚀 Installation & Usage

### Option 1: Run Locally (Windows)

1. Clone the repository:
   ```bash
   git clone https://github.com/Solcen21/CyberPulse.git
   cd CyberPulse
   ```

2. **Quick launch** — Double-click `run_cyberpulse.bat`
   - If Python is installed, it starts a local server at `http://localhost:8085` and opens the browser automatically.
   - If Python is not installed, it opens `index.html` directly (some features like the PWA install prompt may not work without a server).

3. **Manual launch** — Use any local HTTP server:
   ```bash
   # Python
   python -m http.server 8085

   # Node.js (npx)
   npx serve .

   # VS Code
   # Use the "Live Server" extension
   ```

### Option 2: Host on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings** → **Pages**.
3. Set the source branch to `main` and click **Save**.
4. Your dashboard will be live at `https://<username>.github.io/CyberPulse/`.

### Option 3: Any Static Host

Upload all files to any static web host (Netlify, Vercel, Cloudflare Pages, S3, etc.). No build step required.

---

## 📱 Mobile Installation (PWA)

Visit your hosted URL on a mobile device:

| Platform | Steps |
|---|---|
| **iOS (Safari)** | Tap **Share** → **Add to Home Screen** |
| **Android (Chrome)** | Tap **Menu (⋮)** → **Install App** |
| **Desktop (Chrome/Edge)** | Click the install icon in the address bar, or use the in-app **Install App** button |

Once installed, CyberPulse launches as a standalone app with offline support for cached content.

---

## 🔧 Configuration

### Adding/Removing News Feeds

Edit the `NEWS_FEEDS` array at the top of `main.js`:

```javascript
const NEWS_FEEDS = [
    { name: 'Source Name', url: 'https://example.com/rss-feed-url', tag: 'Category' },
    // ...
];
```

- **`name`** — Display name shown on news cards
- **`url`** — Full RSS feed URL
- **`tag`** — Category label. Must match one of the filter buttons: `Vulnerability`, `Breach`, `Security`, `Research`, `Investigation`, `Global`, `Industry`, `Enterprise`, `Tooling`

To add a sidebar panel, also add an entry to `SIDEBAR_FEEDS`:

```javascript
const SIDEBAR_FEEDS = {
    'provider-id': {
        name: 'Display Name',
        url: 'https://example.com/rss-feed-url',
        home: 'https://example.com/'
    },
};
```

Then add a corresponding `<div class="provider-dropdown" data-provider="provider-id">` block in `index.html`.

### Adjusting Refresh Intervals

| Setting | Location | Default |
|---|---|---|
| Main news/breach refresh | `main.js` line 967 | 15 minutes |
| Reddit feed refresh | `main.js` line 955 | 5 minutes |
| CVE initial fetch window | `main.js` line 192 | Last 14 days |
| Search news lookback | `main.js` line 444 | 3 months |
| Search CVE default timeframe | `main.js` line 87 | 3 months |

### Noise Filtering

Articles from broad-tech feeds are filtered using `TECH_NOISE_KEYWORDS` in `main.js`. Add or remove keywords to tune what gets excluded:

```javascript
const TECH_NOISE_KEYWORDS = [
    'iphone', 'android', 'samsung galaxy', 'gaming', 'playstation', 'netflix', ...
];
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 (semantic elements) |
| **Styling** | Vanilla CSS3 (custom properties, Flexbox, Grid, animations) |
| **Logic** | Vanilla JavaScript (ES2020+, async/await, Fetch API) |
| **Typography** | Google Fonts — Outfit, JetBrains Mono |
| **CVE Data** | [NVD API 2.0](https://nvd.nist.gov/developers/vulnerabilities) |
| **RSS Proxy** | [rss2json](https://rss2json.com/) |
| **PWA** | Service Worker + Web App Manifest |

No build tools, no bundlers, no npm dependencies. The entire application is 4 files of source code.

---

## 🔑 API Notes

### rss2json (RSS Feeds)
- Free tier: No API key required for basic usage
- Rate limits apply — the app staggers requests across feeds
- The `&count=50` parameter requests up to 50 items per feed (free tier may cap lower)

### NVD API 2.0 (CVE Data)
- No API key required (public access)
- Rate limited to approximately 5 requests per 30 seconds without a key
- The app delays the CVE fetch by 2 seconds after news/breach fetches to avoid hitting rate limits
- For higher rate limits, [request a free API key](https://nvd.nist.gov/developers/request-an-api-key) and add it to the request URL

---

## 📜 License

Built for the security community.

---

*CyberPulse — Real-Time Threat Intelligence at a Glance*
