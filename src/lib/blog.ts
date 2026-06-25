import { marked } from "marked";
import yaml from "js-yaml";

export type FaqItem = { q: string; a: string };

export type Source = string | { title: string; url: string };

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateModified?: string;
  author?: string;
  format?: string;
  pillar?: string;
  heroImage?: string;
  heroAlt?: string;
  heroCredit?: string;
  inlineImage?: string;
  inlineAlt?: string;
  faq?: FaqItem[];
  sources?: Source[];
};

export type BlogPost = BlogPostMeta & {
  html: string;
};

const rawFiles = import.meta.glob("@/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data = (yaml.load(match[1]) as Record<string, unknown>) ?? {};
  return { data, content: match[2] };
}

function loadPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const path in rawFiles) {
    const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
    const { data, content } = parseFrontmatter(rawFiles[path]);

    posts.push({
      slug,
      title: (data.title as string) ?? slug,
      excerpt: (data.excerpt as string) ?? "",
      date: String(data.date ?? ""),
      dateModified: data.dateModified ? String(data.dateModified) : undefined,
      author: data.author as string | undefined,
      format: data.format as string | undefined,
      pillar: data.pillar as string | undefined,
      heroImage: data.heroImage as string | undefined,
      heroAlt: data.heroAlt as string | undefined,
      heroCredit: data.heroCredit as string | undefined,
      inlineImage: data.inlineImage as string | undefined,
      inlineAlt: data.inlineAlt as string | undefined,
      faq: data.faq as FaqItem[] | undefined,
      sources: data.sources as Source[] | undefined,
      html: marked.parse(content, { async: false }) as string,
    });
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

let cachedPosts: BlogPost[] | null = null;

export function getAllBlogPosts(): BlogPost[] {
  if (!cachedPosts) cachedPosts = loadPosts();
  return cachedPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((p) => p.slug === slug);
}
