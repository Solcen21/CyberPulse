// CyberPulse RSS Worker
// Deploy to Cloudflare Workers — fetches & parses all feeds server-side, no CORS issues.
// After deploying, set YOUR_WORKER_URL in main.js to your worker's URL.

const FEEDS = {
  news: [
    { name: 'The Hacker News',        url: 'https://feeds.feedburner.com/TheHackersNews',              tag: 'Vulnerability' },
    { name: 'Bleeping Computer',       url: 'https://www.bleepingcomputer.com/feed/',                   tag: 'Breach' },
    { name: 'Dark Reading',            url: 'https://www.darkreading.com/rss.xml',                      tag: 'Security' },
    { name: 'CyberScoop',              url: 'https://cyberscoop.com/feed/',                             tag: 'Research' },
    { name: 'SecurityWeek',            url: 'https://www.securityweek.com/feed/',                       tag: 'Vulnerability' },
    { name: 'Krebs on Security',       url: 'https://krebsonsecurity.com/feed/',                        tag: 'Investigation' },
    { name: 'The Record',              url: 'https://therecord.media/feed',                             tag: 'Global' },
    { name: 'Help Net Security',       url: 'https://www.helpnetsecurity.com/feed/',                    tag: 'Industry' },
    { name: 'SC Media',                url: 'https://www.scmagazine.com/rss.xml',                       tag: 'Enterprise' },
    { name: 'Sophos News',             url: 'https://news.sophos.com/en-us/feed/',                      tag: 'Research' },
    { name: 'HackRead',                url: 'https://hackread.com/feed/',                               tag: 'Security' },
    { name: 'Securelist (Kaspersky)',  url: 'https://securelist.com/feed/',                             tag: 'Research' },
    { name: 'CSO Online',              url: 'https://www.csoonline.com/feed/',                          tag: 'Enterprise' },
    { name: 'CrowdStrike',             url: 'https://www.crowdstrike.com/blog/feed/',                   tag: 'Tooling' },
    { name: 'Tenable',                 url: 'https://www.tenable.com/blog/feed',                        tag: 'Tooling' },
    { name: 'Splunk',                  url: 'https://www.splunk.com/en_us/blog/security.rss',           tag: 'Tooling' },
    { name: 'SpecterOps (BloodHound)', url: 'https://posts.specterops.io/feed',                         tag: 'Tooling' },
    { name: 'Velociraptor (Velocidex)',url: 'https://medium.com/feed/@velocidex',                       tag: 'Tooling' },
    { name: 'Rapid7',                  url: 'https://blog.rapid7.com/rss/',                             tag: 'Tooling' },
  ],
  breaches: [
    { name: 'DataBreaches.net',  url: 'https://www.databreaches.net/feed/',                            tag: 'Leak' },
    { name: 'Bleeping (Breach)', url: 'https://www.bleepingcomputer.com/news/security/breach/feed/',   tag: 'Breach' },
  ],
  cves: [
    { name: 'NVD Recent',   url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml' },
    { name: 'NVD Analyzed', url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml' },
  ],
};

// Cache responses for 5 minutes to avoid hammering upstream feeds
const CACHE_TTL = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers — allow your GitHub Pages origin
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': `public, max-age=${CACHE_TTL}`,
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: GET /feeds?type=news|breaches|cves
    if (url.pathname === '/feeds') {
      const type = url.searchParams.get('type') || 'news';
      const feedList = FEEDS[type];
      if (!feedList) {
        return new Response(JSON.stringify({ error: 'Unknown feed type' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Check Cloudflare cache first
      const cacheKey = new Request(`https://cache.cyberpulse/${type}`, request);
      const cache = caches.default;
      let cached = await cache.match(cacheKey);
      if (cached) return new Response(cached.body, { headers: { ...corsHeaders, 'X-Cache': 'HIT', 'Content-Type': 'application/json' } });

      // Fetch all feeds in parallel
      const results = await Promise.allSettled(
        feedList.map(f => fetchAndParseFeed(f))
      );

      const items = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      const json = JSON.stringify({ ok: true, items, fetchedAt: new Date().toISOString() });
      const response = new Response(json, {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

      // Store in cache
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    // Health check
    if (url.pathname === '/') {
      return new Response(JSON.stringify({ status: 'CyberPulse Worker online' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

async function fetchAndParseFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'CyberPulse/1.0 RSS Reader' },
    cf: { cacheTtl: CACHE_TTL }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${feed.url}`);
  const text = await res.text();

  return parseRSS(text, feed);
}

function parseRSS(xml, feed) {
  // Minimal XML parser — handles RSS 2.0 and Atom
  const items = [];

  // Try RSS <item> first, then Atom <entry>
  const isAtom = xml.includes('<feed ') || xml.includes('<feed>');
  const itemTag = isAtom ? 'entry' : 'item';

  const itemRegex = new RegExp(`<${itemTag}[\\s>]([\\s\\S]*?)<\\/${itemTag}>`, 'gi');
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
        description: decodeEntities(stripTags(description)).slice(0, 500),
        source: feed.name,
        tag: feed.tag || 'Security',
      });
    }
  }

  return items.slice(0, 20);
}

function extractTag(xml, tag) {
  // Handles <tag>, <tag attr="...">, and <![CDATA[...]]>
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
}
