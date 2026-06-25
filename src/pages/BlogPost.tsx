import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, Link2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuaLogo } from "@/components/LuaLogo";
import { getBlogPostBySlug, type Source } from "@/lib/blog";

const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const readingTime = (html: string) => {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

const sourceUrl = (src: Source) => typeof src === "string" ? src : src.url;
const sourceLabel = (src: Source) => typeof src === "string" ? src : src.title;
const sourceKey = (src: Source) => typeof src === "string" ? src : `${src.title}-${src.url}`;

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <LuaLogo className="w-8 h-8" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Terug naar blog
            </Link>
          </Button>
        </div>
      </header>

      {/* Article header */}
      <div className="px-5 pt-12 md:pt-16">
        <div className="max-w-[68ch] mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Alle artikelen
          </Link>

          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-7">
              {post.excerpt}
            </p>
          )}

          {/* Byline / meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pb-8 mb-10 border-b border-border/60">
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
                  <User className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-foreground">{post.author}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readingTime(post.html)} min lezen
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="px-5 pb-16">
        <div
          className="prose prose-neutral max-w-[68ch] mx-auto
            prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/80 prose-p:leading-[1.8]
            prose-li:text-foreground/80 prose-li:leading-[1.8] prose-li:my-1
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl
            prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-foreground/80
            prose-img:rounded-2xl prose-img:shadow-medium
            prose-hr:border-border/60"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* Sources */}
        {post.sources && post.sources.length > 0 && (
          <div className="max-w-[68ch] mx-auto mt-14">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 md:p-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground mb-4">
                Bronnen
              </h2>
              <ul className="space-y-3">
                {post.sources.map((src) => {
                  const url = sourceUrl(src);
                  const label = sourceLabel(src);
                  return (
                    <li key={sourceKey(src)} className="flex items-start gap-2.5 text-sm">
                      <Link2 className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                      {isUrl(url) ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-words"
                        >
                          {label}
                        </a>
                      ) : (
                        <span className="text-muted-foreground break-words">{label}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="max-w-[68ch] mx-auto mt-14">
          <div className="rounded-3xl bg-primary/5 border border-primary/20 p-8 md:p-10 text-center">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
              Laat Lua jouw verhuizing regelen
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Beantwoord een paar vragen en krijg direct een persoonlijke checklist.
              Gratis, en Lua doet het zware werk via WhatsApp.
            </p>
            <Button asChild size="lg">
              <Link to="/aanmelden/welkom">
                Start nu
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
