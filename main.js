const NEWS_FEEDS = [
    { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', tag: 'Vulnerability' },
    { name: 'Bleeping Computer', url: 'https://www.bleepingcomputer.com/feed/', tag: 'Breach' },
    { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', tag: 'Security' },
    { name: 'CyberScoop', url: 'https://cyberscoop.com/feed/', tag: 'Research' },
    { name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/', tag: 'Vulnerability' },
    { name: 'ZDNet Security', url: 'https://www.zdnet.com/topic/security/rss.xml', tag: 'Security' }
];

const BREACH_FEEDS = [
    { name: 'DataBreaches.net', url: 'https://www.databreaches.net/feed/', tag: 'Leak' },
    { name: 'Bleeping (Breach)', url: 'https://www.bleepingcomputer.com/news/security/breach/feed/', tag: 'Breach' }
];

const SIDEBAR_FEEDS = {
    'hackernews': { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
    'bleeping': { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
    'darkreading': { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml' },
    'cyberscoop': { name: 'CyberScoop', url: 'https://cyberscoop.com/feed/' },
    'securityweek': { name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/' },
    'zdnet': { name: 'ZDNet Security', url: 'https://www.zdnet.com/topic/security/rss.xml' },
    'crowdstrike': { name: 'CrowdStrike', url: 'https://www.crowdstrike.com/blog/feed/' },
    'huntress': { name: 'Huntress', url: 'https://www.huntress.com/blog/rss.xml' },
    'sentinelone': { name: 'SentinelOne', url: 'https://www.sentinelone.com/labs/feed/' },
    'microsoft': { name: 'Microsoft', url: 'https://msrc.microsoft.com/blog/feed/' },
    'mandiant': { name: 'Mandiant', url: 'https://cloud.google.com/blog/topics/threat-intelligence/rss.xml' },
    'cisa': { name: 'CISA Alerts', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/rss.xml' },
    'nist': { name: 'NIST CSRC', url: 'https://csrc.nist.gov/news/rss' },
    'acsc': { name: 'ACSC (AU)', url: 'https://www.cyber.gov.au/about-us/advisories-and-alerts/rss.xml' }
};

const CVE_API = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const API_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

const newsGrid = document.getElementById('newsGrid');
const breachList = document.getElementById('breachList');
const cveLeaderboard = document.getElementById('cveLeaderboard');
const cveRecentList = document.getElementById('cveRecent');
const searchInput = document.getElementById('newsSearch');
const searchBtn = document.getElementById('searchBtn');
const updateStatus = document.getElementById('update-status');

let allNews = [];
let allBreaches = [];
let allCVEs = [];

// --- Helpers ---

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

function cleanDescription(desc, limit = 150) {
    const temp = document.createElement('div');
    temp.innerHTML = desc;
    let text = temp.textContent || temp.innerText || "";
    if (text.length <= limit) return text;
    return text.substring(0, limit).trim() + '...';
}

// --- Data Fetching & Rendering ---

async function loadIntelligence() {
    updateStatus.textContent = 'Gathering Signals...';

    // We start all fetches in parallel, but don't await them collectively.
    // Each function handles its own rendering as soon as it's ready.
    fetchNews();
    fetchBreaches();
    fetchCVEs();
}

async function fetchNews() {
    try {
        const promises = NEWS_FEEDS.map(f =>
            fetchWithTimeout(`${API_BASE}${encodeURIComponent(f.url)}`)
                .then(r => r.json())
                .then(data => data.status === 'ok' ? data.items.map(item => ({ ...item, source: f.name, tag: f.tag })) : [])
                .catch(() => [])
        );

        const results = await Promise.all(promises);
        allNews = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const recent = allNews.filter(item => new Date(item.pubDate) > fortyEightHoursAgo);

        renderNews(recent.length > 0 ? recent.slice(0, 25) : allNews.slice(0, 15));
        updateStatusText();
    } catch (err) {
        console.error("News fetch failed:", err);
    }
}

async function fetchBreaches() {
    try {
        const promises = BREACH_FEEDS.map(f =>
            fetchWithTimeout(`${API_BASE}${encodeURIComponent(f.url)}`)
                .then(r => r.json())
                .then(data => data.status === 'ok' ? data.items.map(item => ({ ...item, source: f.name, tag: f.tag })) : [])
                .catch(() => [])
        );

        const results = await Promise.all(promises);
        allBreaches = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        renderBreaches(allBreaches.filter(item => new Date(item.pubDate) > thirtyDaysAgo).slice(0, 15));
        updateStatusText();
    } catch (err) {
        console.error("Breach fetch failed:", err);
    }
}

async function fetchCVEs() {
    let now = new Date();
    // Safety check for environment clock issues
    if (now.getFullYear() < 2024) now = new Date('2026-01-18T00:00:00');

    const formatNVDDate = (date) => date.toISOString().replace('Z', '');

    // Target: Filter by current window (14 days) to prioritize recent vulnerabilities
    const windowDays = 14;
    const startDate = formatNVDDate(new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000));

    try {
        console.log(`[CVE] Fetching modern vulnerabilities since: ${startDate}`);
        // NVD API call targeting a shorter window with more results per page
        const res = await fetchWithTimeout(`${CVE_API}?pubStartDate=${startDate}&resultsPerPage=250`, { timeout: 15000 });
        let data = await res.json();

        if (data.vulnerabilities && data.vulnerabilities.length > 0) {
            allCVEs = data.vulnerabilities.map(v => {
                const c = v.cve;
                const metrics = c.metrics?.cvssMetricV31?.[0] || c.metrics?.cvssMetricV30?.[0] || c.metrics?.cvssMetricV2?.[0];
                return {
                    id: c.id,
                    description: (c.descriptions.find(d => d.lang === 'en')?.value || 'No description'),
                    score: metrics?.cvssData?.baseScore || 0,
                    link: `https://nvd.nist.gov/vuln/detail/${c.id}`,
                    date: c.published
                };
            });
            renderCVEs();
            updateStatusText();
        } else {
            throw new Error("Date-based fetch returned zero results");
        }
    } catch (err) {
        let currentYear = new Date().getFullYear();
        if (currentYear < 2024) currentYear = 2026; // Match safety guard
        console.warn(`NVD Date-based fetch failed or returned empty. Searching by keyword 'CVE-${currentYear}'...`);
        try {
            // Fallback: Keyword search for current year to avoid 1999/2000 results
            const fallbackRes = await fetchWithTimeout(`${CVE_API}?keywordSearch=CVE-${currentYear}&resultsPerPage=50`, { timeout: 8000 });
            let data = await fallbackRes.json();
            if (data.vulnerabilities) {
                allCVEs = data.vulnerabilities.map(v => {
                    const c = v.cve;
                    const metrics = c.metrics?.cvssMetricV31?.[0] || c.metrics?.cvssMetricV30?.[0] || c.metrics?.cvssMetricV2?.[0];
                    return {
                        id: c.id,
                        description: c.descriptions[0].value,
                        score: metrics?.cvssData?.baseScore || 0,
                        link: `https://nvd.nist.gov/vuln/detail/${c.id}`,
                        date: c.published
                    };
                });
                renderCVEs();
                updateStatusText();
            }
        } catch (f) {
            console.error("CVE keyword fallback failed:", f);
        }
    }
}

function updateStatusText() {
    const newsCount = allNews.length;
    const bridgeCount = allBreaches.length;
    const cveCount = allCVEs.length;
    updateStatus.textContent = `Live: ${newsCount} News | ${bridgeCount} Breaches | ${cveCount} CVEs`;
}

// --- Rendering Logic ---

function renderNews(newsItems) {
    newsGrid.innerHTML = '';
    newsItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        const dateString = new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
            <div class=\"card-tag\">${item.tag}</div>
            <h3>${item.title}</h3>
            <div class=\"card-content\">
                <p class=\"desc-short\">${cleanDescription(item.description, 150)}</p>
                <p class=\"desc-full\">${cleanDescription(item.description, 1000)}</p>
            </div>
            <a href=\"${item.link}\" target=\"_blank\" class=\"read-full-btn\" onclick=\"event.stopPropagation()\">Read Full Article →</a>
            <div class=\"card-footer\">
                <span class=\"source\">${item.source}</span>
                <span class=\"time\">${dateString}</span>
            </div>
        `;

        card.onclick = () => {
            document.querySelectorAll('.news-card.expanded').forEach(c => { if (c !== card) c.classList.remove('expanded'); });
            card.classList.toggle('expanded');
        };
        newsGrid.appendChild(card);
    });
}

function renderBreaches(breachItems) {
    breachList.innerHTML = '';
    breachItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'breach-item';
        div.onclick = () => window.open(item.link, '_blank');
        const date = new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
        div.innerHTML = `
            <h4>${item.title}</h4>
            <div class=\"breach-meta\">
                <span class=\"breach-source\">${item.source}</span>
                <span class=\"breach-date\">${date}</span>
            </div>
        `;
        breachList.appendChild(div);
    });
}

function renderCVEs() {
    cveLeaderboard.innerHTML = '';
    cveRecentList.innerHTML = '';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sortedByScore = [...allCVEs].sort((a, b) => b.score - a.score);
    const critical = sortedByScore.filter(c => new Date(c.date) > thirtyDaysAgo && c.score >= 1).slice(0, 10);
    const displayCritical = critical.length > 0 ? critical : sortedByScore.slice(0, 10);

    displayCritical.forEach(c => cveLeaderboard.appendChild(createCVEElement(c)));

    [...allCVEs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)
        .forEach(c => cveRecentList.appendChild(createCVEElement(c)));
}

function createCVEElement(cve) {
    const a = document.createElement('a');
    a.className = 'cve-item';
    a.href = cve.link; a.target = '_blank';
    let scoreClass = 'score-medium';
    if (cve.score >= 9.0) scoreClass = 'score-critical';
    else if (cve.score >= 7.0) scoreClass = 'score-high';

    a.innerHTML = `
        <div class=\"score-badge ${scoreClass}\">${cve.score.toFixed(1)}</div>
        <div class=\"cve-info\">
            <div class=\"cve-id\">${cve.id}</div>
            <div class=\"cve-desc\">${cve.description}</div>
        </div>
    `;
    return a;
}

// --- Interaction ---

async function initSidebarIntelligence() {
    const dropdowns = document.querySelectorAll('.provider-dropdown');
    dropdowns.forEach(dropdown => {
        const header = dropdown.querySelector('.provider-header');
        header.onclick = async () => {
            const isOpen = dropdown.classList.toggle('open');
            if (isOpen) {
                const provider = dropdown.dataset.provider;
                const feedContainer = dropdown.querySelector('.provider-feed');
                if (feedContainer.children.length === 0) {
                    await fetchSidebarFeed(provider, feedContainer);
                }
            }
        };
    });
}

async function fetchSidebarFeed(providerId, container) {
    const provider = SIDEBAR_FEEDS[providerId];
    if (!provider) return;

    container.innerHTML = '<div class="feed-item"><div class="feed-item-title">Gathering Intel...</div></div>';

    try {
        const res = await fetchWithTimeout(`${API_BASE}${encodeURIComponent(provider.url)}`);
        const data = await res.json();

        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = '';
            data.items.slice(0, 3).forEach(item => {
                const itemEl = document.createElement('a');
                itemEl.className = 'feed-item';
                itemEl.href = item.link;
                itemEl.target = '_blank';
                itemEl.onclick = (e) => e.stopPropagation();

                const date = new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
                itemEl.innerHTML = `
                    <div class="feed-item-title">${item.title}</div>
                    <div class="feed-item-date">${date}</div>
                `;
                container.appendChild(itemEl);
            });
        } else {
            container.innerHTML = '<div class="feed-item"><div class="feed-item-title">No recent stories found.</div></div>';
        }
    } catch (err) {
        console.error(`Failed to fetch sidebar feed for ${providerId}:`, err);
        container.innerHTML = '<div class="feed-item"><div class="feed-item-title">Service unavailable</div></div>';
    }
}

// --- Discovery & Search ---

const discoveryView = document.getElementById('discoveryView');
const backToNewsBtn = document.getElementById('backToNews');
const mainTitle = document.querySelector('.filter-bar h2');

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        showNewsView();
        return;
    }

    // Filter across all vectors
    const foundNews = allNews.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query)
    );

    const foundBreaches = allBreaches.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query)
    );

    const foundCVEs = allCVEs.filter(item =>
        item.id.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );

    renderDiscovery({ news: foundNews, breaches: foundBreaches, cves: foundCVEs }, query);
}

function showNewsView() {
    discoveryView.style.display = 'none';
    newsGrid.style.display = 'grid';
    backToNewsBtn.style.display = 'none';
    mainTitle.innerHTML = 'Latest News <span class="time-label">(Last 24 Hours)</span>';
}

function renderDiscovery(results, query) {
    newsGrid.style.display = 'none';
    discoveryView.style.display = 'flex';
    backToNewsBtn.style.display = 'flex';
    discoveryView.innerHTML = '';

    mainTitle.innerHTML = `Discovery: <span class="query-highlight">${query}</span>`;

    const totalCount = results.news.length + results.breaches.length + results.cves.length;
    const summary = generateSearchSummary(results, query);

    // Summary Section
    const summaryCard = document.createElement('div');
    summaryCard.className = 'discovery-summary';
    summaryCard.innerHTML = `
        <h3>Intelligence Summary</h3>
        <p>${summary}</p>
    `;
    discoveryView.appendChild(summaryCard);

    // Results Link Sections
    if (results.cves.length > 0) {
        discoveryView.appendChild(createDiscoverySection('Vulnerabilities (CVEs)', results.cves, 'cve'));
    }

    if (results.breaches.length > 0) {
        discoveryView.appendChild(createDiscoverySection('Data Breaches & Leaks', results.breaches, 'breach'));
    }

    if (results.news.length > 0) {
        discoveryView.appendChild(createDiscoverySection('Related Security News', results.news, 'news'));
    }

    if (totalCount === 0) {
        discoveryView.innerHTML += `
            <div class="discovery-section">
                <p>No direct matches found for "${query}" across monitored feeds.</p>
            </div>
        `;
    }
}

function generateSearchSummary(results, query) {
    const { news, breaches, cves } = results;
    let summary = `Your search for "<strong>${query}</strong>" revealed ${news.length + breaches.length + cves.length} relevant intelligence points. `;

    if (cves.length > 0) {
        summary += `The most critical finding is the presence of <strong>${cves.length} vulnerabilities</strong>. `;
    }

    if (breaches.length > 0) {
        summary += `We also identified <strong>${breaches.length} related data breaches</strong> involving this entity. `;
    }

    if (news.length > 0) {
        summary += `Recent security reporting suggests active discussion or exploitation regarding this topic.`;
    }

    if (news.length + breaches.length + cves.length === 0) {
        summary = `No active threats or discussions were found in our current 24-hour window for "<strong>${query}</strong>". Monitor the live feeds for updates.`;
    }

    return summary;
}

function createDiscoverySection(title, items, type) {
    const section = document.createElement('div');
    section.className = 'discovery-section';
    section.innerHTML = `<h4>${title}</h4><div class="discovery-links"></div>`;
    const container = section.querySelector('.discovery-links');

    items.slice(0, 10).forEach(item => {
        const link = document.createElement('a');
        link.className = 'discovery-link-item';
        link.href = item.link;
        link.target = '_blank';

        let itemTitle = item.title || item.id;
        let meta = item.source || (item.score ? `CVSS: ${item.score}` : '');

        link.innerHTML = `
            <span class="link-title">${itemTitle}</span>
            <span class="link-meta">${meta}</span>
        `;
        container.appendChild(link);
    });

    return section;
}

searchBtn.onclick = handleSearch;
backToNewsBtn.onclick = showNewsView;
searchInput.onkeyup = (e) => { if (e.key === 'Enter') handleSearch(); };

function toggleSection(id) {
    document.getElementById(id).classList.toggle('open');
}

// --- PWA Installation ---

let deferredPrompt;
const installBtn = document.getElementById('pwaInstallBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = 'none';
});

// --- Start ---
loadIntelligence();
initSidebarIntelligence();
setInterval(loadIntelligence, 15 * 60 * 1000);
