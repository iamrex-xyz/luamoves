import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/40 py-6 px-5 mt-auto">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70">
      <span>© {new Date().getFullYear()} Lua</span>
      <nav className="flex items-center gap-5">
        <Link to="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
        <a
          href="https://wa.me/31685303918"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Contact
        </a>
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
