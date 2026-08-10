#!/usr/bin/env node
// Post-build step: generates static HTML for /blog and /blog/:slug so
// non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) and social
// scrapers see real content, unique <title>/meta, and JSON-LD — instead
// of the empty SPA shell that `vite build` alone produces.
//
// React still mounts over these files via createRoot() (not hydrateRoot),
// so it simply replaces the prerendered markup on load. No hydration
// mismatch risk, and no changes to the interactive app itself.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src/content/blog");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");
const SITE_URL = "https://www.lua.nl";

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data = yaml.load(match[1]) ?? {};
  return { data, content: match[2] };
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

// Only reference an image in meta/JSON-LD if the file actually exists on
// disk — several posts point at /blog-images/_default-hero.webp, which
// isn't a real file, so referencing it would give crawlers a broken
// og:image (the SPA rewrite serves index.html for the 404, not an image).
function resolveRealImageUrl(imagePath) {
  if (!imagePath) return undefined;
  const onDisk = path.join(PUBLIC_DIR, imagePath.replace(/^\//, ""));
  return fs.existsSync(onDisk) ? `${SITE_URL}${imagePath}` : undefined;
}

function loadPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title ?? slug,
      excerpt: data.excerpt ?? "",
      date: normalizeDate(data.date),
      dateModified: data.dateModified ? normalizeDate(data.dateModified) : undefined,
      author: data.author,
      pillar: data.pillar,
      heroImageUrl: resolveRealImageUrl(data.heroImage),
      faq: Array.isArray(data.faq) ? data.faq : undefined,
      sources: Array.isArray(data.sources) ? data.sources : undefined,
      html: marked.parse(content, { async: false }),
    };
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escape "</" so JSON-LD payloads can never prematurely close the
// surrounding <script> tag if a string value happened to contain it.
function jsonLdScript(obj) {
  const json = JSON.stringify(obj).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

function readBuiltAssets() {
  const shellHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
  const scriptMatch = shellHtml.match(/<script type="module"[^>]*\ssrc="([^"]+)"[^>]*><\/script>/);
  const cssMatch = shellHtml.match(/<link rel="stylesheet"[^>]*\shref="([^"]+)"[^>]*>/);
  if (!scriptMatch) throw new Error("prerender-blog: could not find built entry script in dist/index.html");
  return { scriptSrc: scriptMatch[1], cssHref: cssMatch ? cssMatch[1] : null };
}

function articleJsonLd(post, url) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: { "@type": "Organization", name: post.author || "Lua Redactie" },
    publisher: { "@type": "Organization", name: "Lua" },
    mainEntityOfPage: url,
  };
  if (post.heroImageUrl) obj.image = post.heroImageUrl;
  return obj;
}

function faqJsonLd(post) {
  if (!post.faq || !post.faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function pageShell({ title, description, canonical, extraHead, bodyHtml, assets }) {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
${extraHead}
    ${assets.cssHref ? `<link rel="stylesheet" href="${assets.cssHref}" />` : ""}
  </head>
  <body>
    <div id="root">${bodyHtml}</div>
    <script type="module" src="${assets.scriptSrc}"></script>
  </body>
</html>
`;
}

function renderPostPage(post, assets) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = [articleJsonLd(post, url), faqJsonLd(post)].filter(Boolean).map(jsonLdScript).join("\n    ");

  const extraHead = [
    `    <meta property="og:title" content="${escapeHtml(post.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(post.excerpt)}" />`,
    `    <meta property="og:type" content="article" />`,
    `    <meta property="og:url" content="${url}" />`,
    post.heroImageUrl ? `    <meta property="og:image" content="${post.heroImageUrl}" />` : "",
    `    <meta property="article:published_time" content="${post.date}" />`,
    post.dateModified ? `    <meta property="article:modified_time" content="${post.dateModified}" />` : "",
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    ${jsonLd}`,
  ]
    .filter(Boolean)
    .join("\n");

  const faqHtml = post.faq?.length
    ? `<section><h2>Veelgestelde vragen</h2>${post.faq
        .map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`)
        .join("")}</section>`
    : "";

  const sourcesHtml = post.sources?.length
    ? `<section><h2>Bronnen</h2><ul>${post.sources
        .map((s) => {
          const label = typeof s === "string" ? s : s.title;
          const href = typeof s === "string" ? s : s.url;
          return `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`;
        })
        .join("")}</ul></section>`
    : "";

  const bodyHtml = `<article><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(
    post.excerpt
  )}</p>${post.html}${faqHtml}${sourcesHtml}</article>`;

  return pageShell({
    title: `${post.title} | Lua`,
    description: post.excerpt,
    canonical: url,
    extraHead,
    bodyHtml,
    assets,
  });
}

function renderListPage(posts, assets) {
  const url = `${SITE_URL}/blog`;
  const itemListJsonLd = jsonLdScript({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: p.title,
    })),
  });

  const extraHead = [
    `    <meta property="og:title" content="Het Lua blog" />`,
    `    <meta property="og:description" content="Tips, checklists en achtergrond over verhuizen in Nederland." />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${url}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    ${itemListJsonLd}`,
  ].join("\n");

  const bodyHtml = `<main><h1>Het Lua blog</h1><ul>${posts
    .map(
      (p) =>
        `<li><a href="${SITE_URL}/blog/${p.slug}">${escapeHtml(p.title)}</a><p>${escapeHtml(p.excerpt)}</p></li>`
    )
    .join("")}</ul></main>`;

  return pageShell({
    title: "Het Lua blog — Slim verhuizen, zonder gedoe | Lua",
    description: "Tips, checklists en achtergrond over verhuizen in Nederland, geschreven om je tijd en hoofdruimte te besparen.",
    canonical: url,
    extraHead,
    bodyHtml,
    assets,
  });
}

function renderSitemap(posts) {
  const staticUrls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly" },
    { loc: `${SITE_URL}/blog`, changefreq: "daily" },
  ];
  const postUrls = posts.map((p) => ({
    loc: `${SITE_URL}/blog/${p.slug}`,
    lastmod: p.dateModified || p.date,
    changefreq: "monthly",
  }));

  const entries = [...staticUrls, ...postUrls]
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function main() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    throw new Error("prerender-blog: dist/index.html not found — run `vite build` first.");
  }

  const posts = loadPosts();
  const assets = readBuiltAssets();

  const blogDir = path.join(DIST_DIR, "blog");
  fs.mkdirSync(blogDir, { recursive: true });
  fs.writeFileSync(path.join(blogDir, "index.html"), renderListPage(posts, assets));

  for (const post of posts) {
    const postDir = path.join(blogDir, post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, "index.html"), renderPostPage(post, assets));
  }

  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), renderSitemap(posts));

  console.log(`prerender-blog: wrote dist/blog/index.html + ${posts.length} post pages + dist/sitemap.xml`);
}

main();
