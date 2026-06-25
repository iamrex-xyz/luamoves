import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuaLogo } from "@/components/LuaLogo";
import { getAllBlogPosts, type BlogPost } from "@/lib/blog";
import Footer from "@/components/Footer";

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

const Blog = () => {
  const posts = getAllBlogPosts();
  const [featured, ...rest] = posts;

  const Meta = ({ post }: { post: BlogPost }) => (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>{formatDate(post.date)}</span>
      <span className="w-1 h-1 rounded-full bg-border" />
      <span className="inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        {readingTime(post.html)} min lezen
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <LuaLogo className="w-8 h-8" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Terug
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-14 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
            <BookOpen className="w-3.5 h-3.5" />
            Het Lua blog
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            Slim verhuizen,
            <br className="hidden md:block" /> zonder gedoe
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Tips, checklists en achtergrond over verhuizen — geschreven om je
            kostbare tijd en hoofdruimte te besparen.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 pb-24">
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nog geen artikelen.</p>
        )}

        {/* Featured post */}
        {featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="group block mb-12 bg-white rounded-3xl border border-border/60 shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-primary/15 via-primary-light/40 to-accent/40 p-8 md:p-12 flex items-center justify-center min-h-[200px]">
                <LuaLogo className="w-20 h-20 md:w-28 md:h-28 opacity-90 transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  Uitgelicht
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                  {featured.excerpt}
                </p>
                <Meta post={featured} />
                <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mt-5">
                  Lees artikel
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Rest of posts */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-border/60 p-6 shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300"
              >
                <Meta post={post} />
                <h2 className="font-display text-xl font-semibold text-foreground leading-snug mt-3 mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4">
                  Lees meer
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
