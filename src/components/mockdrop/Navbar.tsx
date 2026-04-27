import { Github, Zap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 glass transition-all ${
        scrolled ? "py-2.5" : "py-4"
      }`}
    >
      <div className="container flex items-center justify-between">
        <button
          onClick={() => scrollTo("top")}
          className="flex items-center gap-2 group"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </span>
          <span className="text-lg font-bold tracking-tight">MockDrop</span>
        </button>

        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>

          <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Free & Open Source
          </span>

          <button
            onClick={() => scrollTo("editor")}
            className="ml-2 btn-primary rounded-md px-4 py-2 text-sm font-semibold"
          >
            Get Started
          </button>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-md hover:bg-elevated"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden container mt-3 pb-3 flex flex-col gap-1 animate-fade-in">
          <button onClick={() => scrollTo("how-it-works")} className="text-left px-3 py-2 rounded-md hover:bg-elevated text-sm">
            How it works
          </button>
          <button onClick={() => scrollTo("features")} className="text-left px-3 py-2 rounded-md hover:bg-elevated text-sm">
            Features
          </button>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md hover:bg-elevated text-sm flex items-center gap-2">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <button onClick={() => scrollTo("editor")} className="btn-primary mt-2 rounded-md px-4 py-2 text-sm font-semibold">
            Get Started
          </button>
        </div>
      )}
    </header>
  );
};
