import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/80 to-white flex flex-col">
      {/* Header */}
      <div className="p-6">
        <span className="text-sm font-medium text-muted-foreground">verhuisplanner</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-2xl mx-auto w-full">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Large headline */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold text-foreground leading-[1.1] tracking-tight">
              404
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Oeps! Deze pagina bestaat niet.
            </p>
          </div>

          {/* Action */}
          <a 
            href="/" 
            className="inline-flex items-center gap-3 group"
          >
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">Terug naar home</span>
            <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
