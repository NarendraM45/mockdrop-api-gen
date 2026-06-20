import { useEffect, useState } from "react";
import { Navbar } from "@/components/mockdrop/Navbar";
import { Hero } from "@/components/mockdrop/Hero";
import { Editor } from "@/components/mockdrop/Editor";
import { HowItWorks } from "@/components/mockdrop/HowItWorks";
import { Features } from "@/components/mockdrop/Features";
import { ActivityLog } from "@/components/mockdrop/ActivityLog";
import { Footer } from "@/components/mockdrop/Footer";
import { EndpointSidebar } from "@/components/mockdrop/EndpointSidebar";
import { CommandPalette } from "@/components/mockdrop/CommandPalette";
import { ShortcutsOverlay } from "@/components/mockdrop/ShortcutsOverlay";
import { WorkspaceProvider } from "@/lib/mockdrop/workspace";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PortalWrapper = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // We want to pin the container, and scrub through the animations.
    // The animations for the blob expanding and the features revealing will be hooked to this ScrollTrigger.
    // We will set up a global ScrollTrigger that we can read from Hero and Features, or just let them use their own triggers on this container.
    
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=2000", // 2000px of scrolling for the portal effect
      pin: true,
      id: "portal-pin"
    });

    return () => st.kill();
  }, []);

  return (
    <div ref={containerRef} id="portal-wrapper" className="relative w-full h-screen overflow-hidden">
      {children}
    </div>
  );
};

const IndexInner = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <div className="flex flex-1 pt-16">
        <EndpointSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
        <main className="flex-1 min-w-0">
          <PortalWrapper>
            <div className="absolute inset-0 z-10 w-full h-full">
              <Hero />
            </div>
            <div className="absolute inset-0 z-20 w-full h-full pointer-events-none" id="features-portal">
              <div className="w-full h-full overflow-y-auto pointer-events-auto">
                <Features />
              </div>
            </div>
          </PortalWrapper>
          <div className="relative z-30 bg-background">
            <HowItWorks />
            <Editor />
            <ActivityLog />
            <Footer />
          </div>
        </main>
      </div>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
};

const Index = () => (
  <WorkspaceProvider>
    <IndexInner />
  </WorkspaceProvider>
);

export default Index;
