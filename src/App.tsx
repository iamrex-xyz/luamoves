import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipToContent, ScreenReaderAnnouncer } from "@/components/accessibility";
import Index from "./pages/Index";

import { TaskDeals } from "./pages/TaskDeals";
import Explore from "./pages/Explore";
import Tasklist from "./pages/Tasklist";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          {/* Accessibility: Skip to content link */}
          <SkipToContent />
          
          {/* Accessibility: Screen reader announcer regions */}
          <ScreenReaderAnnouncer />
          
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              {/* Dutch SEO-friendly onboarding routes */}
              <Route path="/aanmelden" element={<Navigate to="/aanmelden/welkom" replace />} />
              <Route path="/aanmelden/:stap" element={<Index />} />
              <Route path="/deals" element={<TaskDeals />} />
              <Route path="/voorbeelden" element={<Explore />} />
              <Route path="/tasklist" element={<Tasklist />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy" element={<Privacy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
