/**
 * CyberPulse Intelligence Worker
 * 
 * SETUP INSTRUCTIONS:
 * 1. In Cloudflare Dashboard → Workers & Pages → your worker → Settings → Variables
 * 2. Under "KV Namespace Bindings", add:
 *    - Variable name: DB
 *    - KV Namespace: create one called "cyberpulse-db"
 * 3. Under "Triggers" → "Cron Triggers", add: 0 * * * *  (runs every hour)
 * 4. Paste this file into the worker editor and Deploy
 *
 * ROUTES:
 *   GET /feeds?type=news|breaches|cves   — returns cached articles from KV
 *   GET /search?q=QUERY&type=all|news|cves&days=30  — full-text search across KV
 *   GET /cve?id=CVE-2026-1234            — single CVE detail lookup
 *   GET /refresh                          — manually trigger a feed refresh
 *   GET /                                 — health check
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

// ─── Feed Definitions ────────────────────────────────────────────────────────

const NEWS_FEEDS = [
  { name: 'The Hacker News',         url: 'https://feeds.feedburner.com/TheHackersNews',             tag: 'Vulnerability' },
  { name: 'Bleeping Computer',        url: 'https://www.bleepingcomputer.com/feed/',                  tag: 'Breach' },
  { name: 'Dark Reading',             url: 'https://www.darkreading.com/rss.xml',                     tag: 'Security' },
  { name: 'CyberScoop',               url: 'https://cyberscoop.com/feed/',                            tag: 'Research' },
  { name: 'SecurityWeek',             url: 'https://www.securityweek.com/feed/',                      tag: 'Vulnerability' },
  { name: 'Krebs on Security',        url: 'https://krebsonsecurity.com/feed/',                       tag: 'Investigation' },
  { name: 'The Record',               url: 'https://therecord.media/feed',                            tag: 'Global' },
  { name: 'Help Net Security',        url: 'https://www.helpnetsecurity.com/feed/',                   tag: 'Industry' },
  { name: 'SC Media',                 url: 'https://www.scmagazine.com/rss.xml',                      tag: 'Enterprise' },
  { name: 'Sophos News',              url: 'https://news.sophos.com/en-us/feed/',                     tag: 'Research' },
  { name: 'HackRead',                 url: 'https://hackread.com/feed/',                              tag: 'Security' },
  { name: 'Securelist (Kaspersky)',   url: 'https://securelist.com/feed/',                            tag: 'Research' },
  { name: 'CSO Online',               url: 'https://www.csoonline.com/feed/',                         tag: 'Enterprise' },
  { name: 'CrowdStrike',              url: 'https://www.crowdstrike.com/blog/feed/',                  tag: 'Tooling' },
  { name: 'Tenable',                  url: 'https://www.tenable.com/blog/feed',                       tag: 'Tooling' },
  { name: 'Splunk',                   url: 'https://www.splunk.com/en_us/blog/security.rss',          tag: 'Tooling' },
  { name: 'SpecterOps',               url: 'https://posts.specterops.io/feed',                        tag: 'Tooling' },
  { name: 'Velocidex',                url: 'https://medium.com/feed/@velocidex',                      tag: 'Tooling' },
  { name: 'Rapid7',                   url: 'https://blog.rapid7.com/rss/',                            tag: 'Tooling' },
];

const BREACH_FEEDS = [
  { name: 'DataBreaches.net',   url: 'https://www.databreaches.net/feed/',                           tag: 'Leak' },
  { name: 'Bleeping (Breach)',  url: 'https://www.bleepingcomputer.com/news/security/breach/feed/',  tag: 'Breach' },
];

const REDDIT_FEEDS = {
  netsec:             { url: 'https://www.reddit.com/r/netsec/.rss',              label: 'r/netsec' },
  cybersecurity:      { url: 'https://www.reddit.com/r/cybersecurity/.rss',       label: 'r/cybersecurity' },
  hacking:            { url: 'https://www.reddit.com/r/hacking/.rss',             label: 'r/hacking' },
  malware:            { url: 'https://www.reddit.com/r/Malware/.rss',             label: 'r/Malware' },
  AskNetsec:          { url: 'https://www.reddit.com/r/AskNetsec/.rss',           label: 'r/AskNetsec' },
  darkweb:            { url: 'https://www.reddit.com/r/darkweb/.rss',             label: 'r/darkweb' },
  ReverseEngineering: { url: 'https://www.reddit.com/r/ReverseEngineering/.rss',  label: 'r/ReverseEngineering' },
};

const CVE_FEEDS = [
  { name: 'NVD Recent',   url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml' },
  { name: 'NVD Analyzed', url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml' },
];

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default {
  // HTTP requests
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const p = url.pathname.replace(/\/$/, '') || '/';

    // Health check
    if (p === '/') {
      const meta = await env.DB.get('meta:lastRefresh');
      return json({ status: 'online', lastRefresh: meta || 'never' });
    }

    // GET /reddit?sub=netsec
    if (p === '/reddit') {
      const sub = url.searchParams.get('sub') || 'netsec';
      const feed = REDDIT_FEEDS[sub];
      if (!feed) return json({ error: 'Unknown subreddit' }, 400);

      const cacheKey = new Request(`https://cache.cyberpulse/reddit/${sub}`, request);
      const cache = caches.default;
      let cached = await cache.match(cacheKey);
      if (cached) return new Response(cached.body, { headers: { ...corsHeaders, 'X-Cache': 'HIT', 'Content-Type': 'application/json' } });

      try {
        const items = await fetchAndParseFeed({ ...feed, name: feed.label, tag: 'Reddit' });
        const posts = items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          author: item.description?.match(/submitted by.*?<a[^>]*>([^<]+)<\/a>/i)?.[1] || feed.label,
          sub: feed.label,
        }));
        const response = json({ ok: true, posts });
        ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify({ ok: true, posts }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
        })));
        return response;
      } catch (e) {
        return json({ ok: false, error: e.message, posts: [] });
      }
    }

    // GET /feeds?type=news|breaches|cves
    if (p === '/feeds') {
      const type = url.searchParams.get('type') || 'news';
      const raw = await env.DB.get(`articles:${type}`);
      if (!raw) {
        // KV empty — trigger a live fetch on first load
        ctx.waitUntil(refreshAll(env));
        const items = await liveFetch(type);
        return json({ ok: true, items, source: 'live' });
      }
      return json({ ok: true, items: JSON.parse(raw), source: 'db' });
    }

    // GET /search?q=QUERY&type=all|news|cves&days=30
    if (p === '/search') {
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();
      const type = url.searchParams.get('type') || 'all';
      const days = parseInt(url.searchParams.get('days') || '30', 10);

      if (q.length < 2) return json({ ok: true, results: [] });

      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const results = [];

      // Search news + breaches
      if (type === 'all' || type === 'news') {
        for (const bucket of ['news', 'breaches']) {
          const raw = await env.DB.get(`articles:${bucket}`);
          if (!raw) continue;
          const articles = JSON.parse(raw);
          for (const a of articles) {
            const text = `${a.title} ${a.description} ${a.source}`.toLowerCase();
            if (!text.includes(q)) continue;
            if (days > 0 && new Date(a.pubDate).getTime() < cutoff) continue;
            results.push({ ...a, _type: 'article' });
          }
        }
      }

      // Search CVEs
      if (type === 'all' || type === 'cves') {
        const raw = await env.DB.get('articles:cves');
        if (raw) {
          const cves = JSON.parse(raw);
          for (const c of cves) {
            const text = `${c.id} ${c.description}`.toLowerCase();
            if (!text.includes(q)) continue;
            results.push({ ...c, _type: 'cve' });
          }
        }

        // Also hit NVD API directly for deeper CVE search
        try {
          const nvdResults = await searchNVD(q);
          // Merge, de-duplicate by id
          const existingIds = new Set(results.filter(r => r._type === 'cve').map(r => r.id));
          for (const c of nvdResults) {
            if (!existingIds.has(c.id)) results.push({ ...c, _type: 'cve' });
          }
        } catch (e) {
          console.error('NVD search failed:', e);
        }
      }

      // Sort: articles by date desc, CVEs by score desc
      results.sort((a, b) => {
        if (a._type !== b._type) return a._type === 'cve' ? -1 : 1;
        if (a._type === 'cve') return (b.score || 0) - (a.score || 0);
        return new Date(b.pubDate || 0) - new Date(a.pubDate || 0);
      });

      return json({ ok: true, results: results.slice(0, 100), query: q });
    }

    // GET /cve?id=CVE-2026-1234  — single CVE detail
    if (p === '/cve') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'id required' }, 400);
      try {
        const res = await fetch(
          `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(id)}`,
          { headers: { 'User-Agent': 'CyberPulse/1.0' } }
        );
        const data = await res.json();
        const v = data.vulnerabilities?.[0]?.cve;
        if (!v) return json({ error: 'CVE not found' }, 404);
        return json({ ok: true, cve: mapNvdCve({ cve: v }) });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // GET /refresh — manual trigger
    if (p === '/refresh') {
      ctx.waitUntil(refreshAll(env));
      return json({ ok: true, message: 'Refresh triggered' });
    }

    return json({ error: 'Not found' }, 404);
  },

  // Cron trigger — runs every hour
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshAll(env));
  },
};

// ─── Refresh All Feeds → Store in KV ─────────────────────────────────────────

async function refreshAll(env) {
  console.log('[Refresh] Starting full feed refresh');
  await Promise.allSettled([
    refreshBucket(env, 'news', NEWS_FEEDS),
    refreshBucket(env, 'breaches', BREACH_FEEDS),
    refreshCVEs(env),
  ]);
  await env.DB.put('meta:lastRefresh', new Date().toISOString());
  console.log('[Refresh] Done');
}

async function refreshBucket(env, bucket, feeds) {
  const results = await Promise.allSettled(feeds.map(f => fetchAndParseFeed(f)));
  const items = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Keep up to 500 articles per bucket, expiring after 7 days
  await env.DB.put(`articles:${bucket}`, JSON.stringify(items.slice(0, 500)), {
    expirationTtl: 7 * 24 * 60 * 60,
  });
  console.log(`[Refresh] ${bucket}: stored ${items.length} items`);
}

async function refreshCVEs(env) {
  const results = await Promise.allSettled(CVE_FEEDS.map(f => fetchAndParseFeed(f)));
  const raw = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);

  const seen = new Set();
  const cves = raw
    .filter(item => {
      const id = item.title?.match(/CVE-\d{4}-\d+/)?.[0];
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(item => {
      const id = item.title.match(/CVE-\d{4}-\d+/)?.[0] || item.title;
      const desc = item.description || '';
      const scoreMatch = desc.match(/cvss\s+v[\d.]+[:\s]+(\d+\.?\d*)/i)
        || desc.match(/base\s+score[:\s]+(\d+\.?\d*)/i)
        || desc.match(/score[:\s]+(\d+\.?\d*)/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
      const cleanDesc = (desc || item.title.replace(/^CVE-\d{4}-\d+\s*[-–:]\s*/, '') || 'No description').slice(0, 500);
      return {
        id,
        description: cleanDesc,
        score,
        link: item.link || `https://nvd.nist.gov/vuln/detail/${id}`,
        date: item.pubDate || new Date().toISOString(),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  await env.DB.put('articles:cves', JSON.stringify(cves.slice(0, 200)), {
    expirationTtl: 2 * 24 * 60 * 60,
  });
  console.log(`[Refresh] cves: stored ${cves.length} items`);
}

// Live fetch fallback when KV is empty
async function liveFetch(type) {
  const feedMap = { news: NEWS_FEEDS, breaches: BREACH_FEEDS, cves: CVE_FEEDS };
  const feeds = feedMap[type] || [];
  const results = await Promise.allSettled(feeds.map(f => fetchAndParseFeed(f)));
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

// ─── NVD API Search (server-side, no CORS issues) ────────────────────────────

async function searchNVD(keyword) {
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=50`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CyberPulse/1.0' },
  });
  if (!res.ok) throw new Error(`NVD HTTP ${res.status}`);
  const data = await res.json();
  if (!data.vulnerabilities) return [];
  return data.vulnerabilities.map(v => mapNvdCve(v));
}

function mapNvdCve(v) {
  const c = v.cve;
  const metrics = c.metrics?.cvssMetricV31?.[0] || c.metrics?.cvssMetricV30?.[0] || c.metrics?.cvssMetricV2?.[0];
  const score = metrics?.cvssData?.baseScore || 0;
  const severity = score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : score > 0 ? 'LOW' : 'N/A';
  return {
    id: c.id,
    description: c.descriptions?.find(d => d.lang === 'en')?.value || 'No description',
    score,
    severity,
    link: `https://nvd.nist.gov/vuln/detail/${c.id}`,
    date: c.published || '',
    references: (c.references || []).slice(0, 5).map(r => r.url),
  };
}

// ─── RSS Feed Fetcher & Parser ────────────────────────────────────────────────

async function fetchAndParseFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'CyberPulse/1.0 RSS Reader' },
    cf: { cacheTtl: 300 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${feed.url}`);
  const text = await res.text();
  return parseRSS(text, feed);
}

function parseRSS(xml, feed) {
  const isAtom = xml.includes('<feed ') || xml.includes('<feed>');
  const itemTag = isAtom ? 'entry' : 'item';
  const itemRegex = new RegExp(`<${itemTag}[\\s>]([\\s\\S]*?)<\\/${itemTag}>`, 'gi');
  const items = [];
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, 'title');
    const link = isAtom
      ? (extractAttr(block, 'link', 'href') || extractTag(block, 'link') || extractTag(block, 'id'))
      : (extractTag(block, 'link') || extractTag(block, 'guid'));
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated') || '';
    const description = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content') || '';

    if (title && link) {
      items.push({
        title: decodeEntities(stripTags(title)),
        link: link.trim(),
        pubDate,
        description: decodeEntities(stripTags(description)).slice(0, 600),
        source: feed.name,
        tag: feed.tag || 'Security',
      });
    }
  }
  return items.slice(0, 25);
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function stripTags(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)));
}

// appended — this block is intentionally blank, real edits below
