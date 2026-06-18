const NEWS_FEEDS = [
    { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', tag: 'Vulnerability' },
    { name: 'Bleeping Computer', url: 'https://www.bleepingcomputer.com/feed/', tag: 'Breach' },
    { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', tag: 'Security' },
    { name: 'CyberScoop', url: 'https://cyberscoop.com/feed/', tag: 'Research' },
    { name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/', tag: 'Vulnerability' },
    { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', tag: 'Investigation' },
    { name: 'The Record', url: 'https://therecord.media/feed', tag: 'Global' },
    { name: 'Help Net Security', url: 'https://www.helpnetsecurity.com/feed/', tag: 'Industry' },
    { name: 'SC Media', url: 'https://www.scmagazine.com/rss.xml', tag: 'Enterprise' },
    { name: 'Sophos News', url: 'https://news.sophos.com/en-us/feed/', tag: 'Research' },
    { name: 'HackRead', url: 'https://hackread.com/feed/', tag: 'Security' },
    { name: 'Securelist (Kaspersky)', url: 'https://securelist.com/feed/', tag: 'Research' },
    { name: 'CSO Online', url: 'https://www.csoonline.com/feed/', tag: 'Enterprise' },
    // Security tooling vendor blogs
    { name: 'CrowdStrike', url: 'https://www.crowdstrike.com/blog/feed/', tag: 'Tooling' },
    { name: 'Tenable', url: 'https://www.tenable.com/blog/feed', tag: 'Tooling' },
    { name: 'Splunk', url: 'https://www.splunk.com/en_us/blog/security.rss', tag: 'Tooling' },
    { name: 'SpecterOps (BloodHound)', url: 'https://posts.specterops.io/feed', tag: 'Tooling' },
    { name: 'Velociraptor (Velocidex)', url: 'https://medium.com/feed/@velocidex', tag: 'Tooling' },
    { name: 'Rapid7', url: 'https://blog.rapid7.com/rss/', tag: 'Tooling' }
];

// Keywords used to filter out general/non-cyber tech articles from broad-tech sources
const TECH_NOISE_KEYWORDS = [
    'iphone', 'android', 'samsung galaxy', 'pixel phone', 'macbook', 'windows 11 feature',
    'gaming', 'playstation', 'xbox', 'nintendo', 'streaming service', 'netflix', 'social media app',
    'electric vehicle', 'tesla model', 'smart home', 'wearable', 'smartwatch', 'review:'
];

function isCyberRelevant(item) {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    return !TECH_NOISE_KEYWORDS.some(kw => text.includes(kw));
}

const BREACH_FEEDS = [
    { name: 'DataBreaches.net', url: 'https://www.databreaches.net/feed/', tag: 'Leak' },
    { name: 'Bleeping (Breach)', url: 'https://www.bleepingcomputer.com/news/security/breach/feed/', tag: 'Breach' }
];

const SIDEBAR_FEEDS = {
    'hackernews': { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', home: 'https://thehackernews.com/' },
    'bleeping': { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', home: 'https://www.bleepingcomputer.com/' },
    'darkreading': { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', home: 'https://www.darkreading.com/' },
    'cyberscoop': { name: 'CyberScoop', url: 'https://cyberscoop.com/feed/', home: 'https://cyberscoop.com/' },
    'securityweek': { name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/', home: 'https://www.securityweek.com/' },
    'krebs': { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', home: 'https://krebsonsecurity.com/' },
    'therecord': { name: 'The Record', url: 'https://therecord.media/feed', home: 'https://therecord.media/' },
    'helpnet': { name: 'Help Net Security', url: 'https://www.helpnetsecurity.com/feed/', home: 'https://www.helpnetsecurity.com/' },
    'scmedia': { name: 'SC Media', url: 'https://www.scmagazine.com/rss.xml', home: 'https://www.scmagazine.com/' },
    'sophos': { name: 'Sophos News', url: 'https://news.sophos.com/en-us/feed/', home: 'https://news.sophos.com/en-us/' },
    'hackread': { name: 'HackRead', url: 'https://hackread.com/feed/', home: 'https://hackread.com/' },
    'securelist': { name: 'Securelist (Kaspersky)', url: 'https://securelist.com/feed/', home: 'https://securelist.com/' },
    'csoonline': { name: 'CSO Online', url: 'https://www.csoonline.com/feed/', home: 'https://www.csoonline.com/' },
    'crowdstrike': { name: 'CrowdStrike', url: 'https://www.crowdstrike.com/blog/feed/', home: 'https://www.crowdstrike.com/blog/' },
    'tenable': { name: 'Tenable', url: 'https://www.tenable.com/blog/feed', home: 'https://www.tenable.com/blog' },
    'splunk': { name: 'Splunk Security', url: 'https://www.splunk.com/en_us/blog/security.rss', home: 'https://www.splunk.com/en_us/blog/security.html' },
    'specterops': { name: 'SpecterOps (BloodHound)', url: 'https://posts.specterops.io/feed', home: 'https://posts.specterops.io/' },
    'velociraptor': { name: 'Velociraptor', url: 'https://medium.com/feed/@velocidex', home: 'https://medium.com/@velocidex' },
    'rapid7': { name: 'Rapid7', url: 'https://blog.rapid7.com/rss/', home: 'https://blog.rapid7.com/' },
    'huntress': { name: 'Huntress', url: 'https://www.huntress.com/blog/rss.xml', home: 'https://www.huntress.com/blog/' },
    'sentinelone': { name: 'SentinelOne', url: 'https://www.sentinelone.com/labs/feed/', home: 'https://www.sentinelone.com/labs/' },
    'microsoft': { name: 'Microsoft', url: 'https://msrc.microsoft.com/blog/feed/', home: 'https://msrc.microsoft.com/blog/' },
    'mandiant': { name: 'Mandiant', url: 'https://cloud.google.com/blog/topics/threat-intelligence/rss.xml', home: 'https://cloud.google.com/blog/topics/threat-intelligence/' },
    'cisa': { name: 'CISA Alerts', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/rss.xml', home: 'https://www.cisa.gov/' },
    'nist': { name: 'NIST CSRC', url: 'https://csrc.nist.gov/news/rss', home: 'https://csrc.nist.gov/' },
    'acsc': { name: 'ACSC (AU)', url: 'https://www.cyber.gov.au/about-us/advisories-and-alerts/rss.xml', home: 'https://www.cyber.gov.au/' }
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
const categoryFilters = document.getElementById('categoryFilters');

let allNews = [];
let allBreaches = [];
let allCVEs = [];
let currentTagFilter = 'all';
let currentSearchQuery = '';
let currentCveTimeframe = '3m';

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
    // Delay CVE fetch by 2s to avoid NVD rate-limiting when news/breach fetches also fire
    setTimeout(fetchCVEs, 2000);
}

async function fetchNews() {
    try {
        const promises = NEWS_FEEDS.map(f =>
            fetchWithTimeout(`${API_BASE}${encodeURIComponent(f.url)}&count=10`)
                .then(r => r.json())
                .then(data => data.status === 'ok'
                    ? data.items
                        .map(item => ({ ...item, source: f.name, tag: f.tag }))
                        .filter(isCyberRelevant)
                    : [])
                .catch(() => [])
        );

        const results = await Promise.all(promises);
        allNews = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        filterAndRenderNews();
        updateStatusText();
    } catch (err) {
        console.error("News fetch failed:", err);
    }
}

function filterAndRenderNews() {
    let itemsToRender = allNews;

    if (currentTagFilter === 'all') {
        // Show all available articles sorted by date (no time-based cutoff)
        itemsToRender = allNews.slice(0, 100);
    } else {
        itemsToRender = allNews
            .filter(item => item.tag.toLowerCase() === currentTagFilter.toLowerCase())
            .slice(0, 100);
    }

    renderNews(itemsToRender);
}

async function fetchBreaches() {
    try {
        const promises = BREACH_FEEDS.map(f =>
            fetchWithTimeout(`${API_BASE}${encodeURIComponent(f.url)}&count=10`)
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

function createNewsCard(item) {
    const card = document.createElement('div');
    card.className = 'news-card';
    const dateString = new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const tagClass = 'tag-' + item.tag.toLowerCase();

    card.innerHTML = `
        <div class="card-tag ${tagClass}">${item.tag}</div>
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

    return card;
}

function renderNews(newsItems) {
    newsGrid.innerHTML = '';
    newsItems.forEach(item => newsGrid.appendChild(createNewsCard(item)));
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
        const providerId = dropdown.dataset.provider;

        // Inject Direct Link
        const feedConfig = SIDEBAR_FEEDS[providerId];
        const nameSpan = header.querySelector('span:not(.dropdown-icon)');

        if (nameSpan && feedConfig && feedConfig.home) {
            const link = document.createElement('a');
            link.href = feedConfig.home;
            link.target = "_blank";
            link.className = "direct-link-icon";
            link.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
            link.onclick = (e) => e.stopPropagation();
            link.title = `Visit ${feedConfig.name}`;
            nameSpan.appendChild(link);
        }

        header.onclick = async () => {
            const isOpen = dropdown.classList.toggle('open');
            if (isOpen) {
                const feedContainer = dropdown.querySelector('.provider-feed');
                if (feedContainer.children.length === 0) {
                    await fetchSidebarFeed(providerId, feedContainer);
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
                const itemEl = document.createElement('div');
                itemEl.className = 'feed-item';

                const date = new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
                itemEl.innerHTML = `
                    <div class="feed-item-content">
                        <a href="${item.link}" target="_blank" class="feed-link-title">${item.title}</a>
                        <div class="feed-meta">
                            <span class="feed-date">${date}</span>
                            <a href="${item.link}" target="_blank" class="feed-external-link">🔗 Open</a>
                        </div>
                    </div>
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

async function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        showNewsView();
        return;
    }

    currentSearchQuery = query;
    currentCveTimeframe = '3m'; // Reset to default 3 months for new search

    // visual feedback
    mainTitle.innerHTML = `Searching for "<span class="query-highlight">${query}</span>"...`;
    discoveryView.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
    newsGrid.style.display = 'none';
    categoryFilters.style.display = 'none';
    discoveryView.style.display = 'flex';
    backToNewsBtn.style.display = 'flex';

    try {
        // 1. Live CVE Search targeting timeframe (CVE-centric: search NVD by product/keyword)
        const liveCVEs = await searchCVEs(query, currentCveTimeframe);

        // Extract CVE IDs to cross-reference against news articles
        const cveIds = liveCVEs.map(c => c.id.toLowerCase());

        // 2. Filter News (Last 3 Months) — match query text OR any associated CVE IDs
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const foundNews = allNews.filter(item => {
            const itemDate = new Date(item.pubDate);
            if (itemDate < threeMonthsAgo) return false;

            const titleLower = item.title.toLowerCase();
            const descLower = (item.description || '').toLowerCase();
            const sourceLower = item.source.toLowerCase();

            // Match by search query text
            const matchesQuery = titleLower.includes(query) ||
                descLower.includes(query) ||
                sourceLower.includes(query);

            // Match by CVE ID cross-reference (CVE-centric: pulls in articles about related CVEs)
            const matchesCve = cveIds.length > 0 &&
                cveIds.some(id => titleLower.includes(id) || descLower.includes(id));

            return matchesQuery || matchesCve;
        });

        // 3. Filter Breaches — match query text OR CVE IDs
        const foundBreaches = allBreaches.filter(item => {
            const titleLower = item.title.toLowerCase();
            const matchesQuery = titleLower.includes(query) || item.source.toLowerCase().includes(query);
            const matchesCve = cveIds.length > 0 && cveIds.some(id => titleLower.includes(id));
            return matchesQuery || matchesCve;
        });

        // 4. Combine Local CVEs + Live CVEs (Deduplicate by ID)
        const localCVEMatches = allCVEs.filter(item =>
            item.id.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );

        // Map to ensure unique IDs — live CVE results take precedence
        const cveMap = new Map();
        localCVEMatches.forEach(c => cveMap.set(c.id, c));
        liveCVEs.forEach(c => cveMap.set(c.id, c));

        const uniqueCVEs = Array.from(cveMap.values());

        renderDiscovery({ news: foundNews, breaches: foundBreaches, cves: uniqueCVEs }, query);

    } catch (error) {
        console.error("Search failed:", error);
        discoveryView.innerHTML = `<div class="discovery-section"><p>Search failed. Please try again.</p></div>`;
    }
}

async function searchCVEs(keyword, timeframe = '6m') {
    if (keyword.length < 3) return []; // optimization
    try {
        // Step 1: Query NVD metadata to get totalResults count
        const initialUrl = `${CVE_API}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=1`;
        const initialRes = await fetchWithTimeout(initialUrl, { timeout: 10000 });
        const initialData = await initialRes.json();
        const totalResults = initialData.totalResults || 0;

        if (totalResults === 0) return [];

        let vulnerabilities = [];

        if (timeframe === 'all-old') {
            // Fetch oldest first starting at 0
            const url = `${CVE_API}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=50&startIndex=0`;
            const res = await fetchWithTimeout(url, { timeout: 10000 });
            const data = await res.json();
            if (data.vulnerabilities) {
                vulnerabilities = data.vulnerabilities.map(mapNvdCve);
            }
        } else if (timeframe === 'all-new') {
            // Fetch newest first by querying the end of the list
            const fetchCount = Math.min(50, totalResults);
            const startIndex = Math.max(0, totalResults - fetchCount);
            const url = `${CVE_API}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=${fetchCount}&startIndex=${startIndex}`;
            const res = await fetchWithTimeout(url, { timeout: 10000 });
            const data = await res.json();
            if (data.vulnerabilities) {
                vulnerabilities = data.vulnerabilities.map(mapNvdCve).reverse();
            }
        } else {
            // Recent timeframes: '3m', '6m', or '12m'
            // We fetch the latest 100 results and filter them client-side by publication date
            const fetchCount = Math.min(100, totalResults);
            const startIndex = Math.max(0, totalResults - fetchCount);
            const url = `${CVE_API}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=${fetchCount}&startIndex=${startIndex}`;
            const res = await fetchWithTimeout(url, { timeout: 10000 });
            const data = await res.json();
            if (data.vulnerabilities) {
                const now = Date.now();
                const limitMonths = timeframe === '3m' ? 3 : (timeframe === '6m' ? 6 : 12);
                const limitMs = limitMonths * 30 * 24 * 60 * 60 * 1000;

                vulnerabilities = data.vulnerabilities
                    .map(mapNvdCve)
                    .reverse()
                    .filter(c => {
                        const pubTime = new Date(c.date).getTime();
                        return (now - pubTime) <= limitMs;
                    });
            }
        }
        return vulnerabilities;
    } catch (e) {
        console.warn("Live CVE search error:", e);
        return [];
    }
}

function mapNvdCve(v) {
    const c = v.cve;
    const metrics = c.metrics?.cvssMetricV31?.[0] || c.metrics?.cvssMetricV30?.[0] || c.metrics?.cvssMetricV2?.[0];
    return {
        id: c.id,
        description: (c.descriptions.find(d => d.lang === 'en')?.value || 'No description'),
        score: metrics?.cvssData?.baseScore || 0,
        link: `https://nvd.nist.gov/vuln/detail/${c.id}`,
        date: c.published
    };
}


function showNewsView() {
    discoveryView.style.display = 'none';
    newsGrid.style.display = 'grid';
    categoryFilters.style.display = 'flex';
    backToNewsBtn.style.display = 'none';
    mainTitle.innerHTML = 'Latest News <span class="time-label">(All Available)</span>';
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
    if (results.news.length > 0) {
        discoveryView.appendChild(createDiscoverySection('Related Security News (Last 3 Months)', results.news, 'news'));
    }

    // Always append CVE section to allow timeframe switching
    discoveryView.appendChild(createCveDiscoverySection('Vulnerabilities (CVEs)', results.cves));

    if (results.breaches.length > 0) {
        discoveryView.appendChild(createDiscoverySection('Data Breaches & Leaks', results.breaches, 'breach'));
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
        summary += `The most critical finding is the presence of <strong>${cves.length} vulnerabilities</strong> (including historical records). `;
    }

    if (breaches.length > 0) {
        summary += `We also identified <strong>${breaches.length} related data breaches</strong> involving this entity. `;
    }

    if (news.length > 0) {
        summary += `Recent security reporting (last 3 months) suggests active discussion or exploitation regarding this topic.`;
    } else {
        summary += `No news from the last 3 months found.`;
    }

    if (news.length + breaches.length + cves.length === 0) {
        summary = `No active threats or discussions were found within our search parameters (News: 3 Months, CVEs: All Time) for "<strong>${query}</strong>". Monitor the live feeds for updates.`;
    }

    return summary;
}

function createDiscoverySection(title, items, type) {
    const section = document.createElement('div');
    section.className = 'discovery-section';

    if (type === 'news') {
        section.innerHTML = `<h4>${title}</h4><div class="discovery-news-grid"></div>`;
        const container = section.querySelector('.discovery-news-grid');
        items.forEach(item => container.appendChild(createNewsCard(item)));
        return section;
    }

    section.innerHTML = `<h4>${title}</h4><div class="discovery-links"></div>`;
    const container = section.querySelector('.discovery-links');

    items.slice(0, 10).forEach(item => {
        const link = document.createElement('a');
        link.className = 'discovery-link-item';
        link.href = item.link;
        link.target = '_blank';

        let itemTitle = item.title || item.id;
        let meta = item.source || (item.score ? `CVSS: ${item.score}` : '');

        // function to truncate or clean description - reusing existing helper logic but for inside search item
        if (type === 'cve' && item.description) {
            let cleanDesc = cleanDescription(item.description, 120);
            link.innerHTML = `
            <div class="link-left">
                <span class="link-title">${itemTitle}</span>
                <span class="link-desc-mini">${cleanDesc}</span>
            </div>
            <span class="link-meta">${meta}</span>
        `;
        } else {
            link.innerHTML = `
            <span class="link-title">${itemTitle}</span>
            <span class="link-meta">${meta}</span>
        `;
        }
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

function initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.onclick = () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTagFilter = btn.dataset.category;
            filterAndRenderNews();
        };
    });
}

function getCveSeverity(score) {
    if (score >= 9.0) return { label: 'Critical', className: 'sev-critical' };
    if (score >= 7.0) return { label: 'High', className: 'sev-high' };
    if (score >= 4.0) return { label: 'Medium', className: 'sev-medium' };
    if (score > 0) return { label: 'Low', className: 'sev-low' };
    return { label: 'Unknown', className: 'sev-unknown' };
}

function buildCveTableRows(items) {
    return items.map(item => {
        const sev = getCveSeverity(item.score);
        const desc = cleanDescription(item.description, 160);
        const dateStr = item.date ? new Date(item.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
        return `
            <tr onclick="window.open('${item.link}', '_blank')">
                <td class="cve-table-id"><a href="${item.link}" target="_blank" onclick="event.stopPropagation()">${item.id}</a></td>
                <td><span class="severity-badge ${sev.className}">${sev.label}${item.score ? ` (${item.score.toFixed(1)})` : ''}</span></td>
                <td class="cve-table-desc">${desc}</td>
                <td class="cve-table-date">${dateStr}</td>
            </tr>
        `;
    }).join('');
}

function buildCveTable(items) {
    if (!items || items.length === 0) {
        return '<div class="discovery-link-item" style="cursor: default; background: transparent; justify-content: center; color: var(--text-muted);">No CVEs found for this timeframe.</div>';
    }
    return `
        <div class="cve-table-wrapper">
            <table class="cve-table">
                <thead>
                    <tr>
                        <th>CVE ID</th>
                        <th>Severity</th>
                        <th>Description</th>
                        <th>Published</th>
                    </tr>
                </thead>
                <tbody>
                    ${buildCveTableRows(items.slice(0, 30))}
                </tbody>
            </table>
        </div>
    `;
}

function createCveDiscoverySection(title, items) {
    const section = document.createElement('div');
    section.className = 'discovery-section';
    section.innerHTML = `
        <div class="discovery-section-header">
            <h4>${title}</h4>
            <div class="cve-timeframe-selector">
                <label for="cveTimeframe">Timeframe:</label>
                <select id="cveTimeframe">
                    <option value="3m" ${currentCveTimeframe === '3m' ? 'selected' : ''}>Last 3 Months</option>
                    <option value="6m" ${currentCveTimeframe === '6m' ? 'selected' : ''}>Last 6 Months</option>
                    <option value="12m" ${currentCveTimeframe === '12m' ? 'selected' : ''}>Last 12 Months</option>
                    <option value="all-new" ${currentCveTimeframe === 'all-new' ? 'selected' : ''}>All Time (Newest)</option>
                    <option value="all-old" ${currentCveTimeframe === 'all-old' ? 'selected' : ''}>All Time (Oldest)</option>
                </select>
            </div>
        </div>
        <div id="cveDiscoveryLinks">${buildCveTable(items)}</div>
    `;

    const select = section.querySelector('#cveTimeframe');
    select.onchange = async () => {
        currentCveTimeframe = select.value;
        await refreshCveSearch();
    };

    return section;
}

async function refreshCveSearch() {
    const cveContainer = document.querySelector('#cveDiscoveryLinks');
    if (!cveContainer) return;

    cveContainer.innerHTML = '<div class="skeleton-item" style="height: 50px; margin-bottom: 10px;"></div><div class="skeleton-item" style="height: 50px;"></div>';

    const cves = await searchCVEs(currentSearchQuery, currentCveTimeframe);

    cveContainer.innerHTML = buildCveTable(cves);
}

function initSidebarCollapsing() {
    const container = document.querySelector('.app-container');
    const collapseLeftBtn = document.getElementById('collapseLeftBtn');
    const collapseRightBtn = document.getElementById('collapseRightBtn');
    const expandLeftBtn = document.getElementById('expandLeftBtn');
    const expandRightBtn = document.getElementById('expandRightBtn');

    if (collapseLeftBtn && expandLeftBtn) {
        collapseLeftBtn.onclick = () => {
            container.classList.add('collapsed-left');
            expandLeftBtn.style.display = 'flex';
        };
        expandLeftBtn.onclick = () => {
            container.classList.remove('collapsed-left');
            expandLeftBtn.style.display = 'none';
        };
    }

    if (collapseRightBtn && expandRightBtn) {
        collapseRightBtn.onclick = () => {
            container.classList.add('collapsed-right');
            expandRightBtn.style.display = 'flex';
        };
        expandRightBtn.onclick = () => {
            container.classList.remove('collapsed-right');
            expandRightBtn.style.display = 'none';
        };
    }
}

// --- Reddit Community Feed ---

const REDDIT_FEEDS = {
    'netsec':         { url: 'https://www.reddit.com/r/netsec/.rss',           label: 'r/netsec' },
    'cybersecurity':  { url: 'https://www.reddit.com/r/cybersecurity/.rss',    label: 'r/cybersecurity' },
    'hacking':        { url: 'https://www.reddit.com/r/hacking/.rss',          label: 'r/hacking' },
    'malware':        { url: 'https://www.reddit.com/r/Malware/.rss',          label: 'r/Malware' },
    'AskNetsec':      { url: 'https://www.reddit.com/r/AskNetsec/.rss',        label: 'r/AskNetsec' },
    'darkweb':        { url: 'https://www.reddit.com/r/darkweb/.rss',          label: 'r/darkweb' },
    'ReverseEngineering': { url: 'https://www.reddit.com/r/ReverseEngineering/.rss', label: 'r/ReverseEngineering' }
};

let activeRedditSub = 'netsec';
let redditFeedCache = {};

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

function getInitials(name) {
    return name.replace(/^(r\/|u\/)/, '').substring(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#00ff9d', '#00d4ff', '#a55eea', '#ff758f', '#ffb142', '#2bcbba'];
function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

async function fetchRedditFeed(sub) {
    if (redditFeedCache[sub]) {
        renderRedditFeed(redditFeedCache[sub]);
        return;
    }

    const container = document.getElementById('xFeedContainer');
    container.innerHTML = '<div class="skeleton-item mini"></div><div class="skeleton-item mini" style="margin-top:8px"></div><div class="skeleton-item mini" style="margin-top:8px"></div>';

    const feed = REDDIT_FEEDS[sub];
    if (!feed) return;

    try {
        const res = await fetchWithTimeout(`${API_BASE}${encodeURIComponent(feed.url)}`, { timeout: 8000 });
        const data = await res.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            const posts = data.items.slice(0, 12).map(item => ({
                title: item.title,
                author: item.author ? `u/${item.author.replace(/^u\//, '')}` : feed.label,
                link: item.link,
                date: item.pubDate,
                sub: feed.label
            }));
            redditFeedCache[sub] = posts;
            renderRedditFeed(posts);
        } else {
            container.innerHTML = `<div class="x-feed-error">No posts found for ${feed.label}.</div>`;
        }
    } catch (e) {
        console.warn(`[Reddit Feed] Failed for ${sub}:`, e.message);
        container.innerHTML = `<div class="x-feed-error">Could not load ${feed.label}. <a href="https://reddit.com/r/${sub}" target="_blank">View on Reddit →</a></div>`;
    }
}

function renderRedditFeed(posts) {
    const container = document.getElementById('xFeedContainer');
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="x-feed-error">No posts found.</div>';
        return;
    }

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'x-tweet-item';
        div.onclick = () => window.open(post.link, '_blank');

        const color = avatarColor(post.sub);
        const initials = getInitials(post.sub);
        const ago = timeAgo(post.date);

        div.innerHTML = `
            <div class="x-tweet-header">
                <div class="x-avatar" style="background:${color}; color:#000;">${initials}</div>
                <span class="x-handle" style="color:var(--secondary-color)">${post.sub}</span>
                <span class="x-time">${ago}</span>
            </div>
            <div class="x-text" style="color:var(--text-main); font-size:0.8rem;">${post.title}</div>
            <div class="x-meta"><span style="opacity:0.5">by ${post.author}</span></div>
        `;
        container.appendChild(div);
    });
}

function initXFeed() {
    const tabs = document.querySelectorAll('.x-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeRedditSub = tab.dataset.tag;
            fetchRedditFeed(activeRedditSub);
        };
    });
    fetchRedditFeed(activeRedditSub);
    setInterval(() => {
        delete redditFeedCache[activeRedditSub];
        fetchRedditFeed(activeRedditSub);
    }, 5 * 60 * 1000);
}

// --- Start ---
loadIntelligence();
initSidebarIntelligence();
initCategoryFilters();
initSidebarCollapsing();
initXFeed();
setInterval(loadIntelligence, 15 * 60 * 1000);
