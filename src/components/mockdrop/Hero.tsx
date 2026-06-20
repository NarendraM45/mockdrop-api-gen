import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock, Infinity as InfinityIcon, ShieldCheck, Activity, Copy, Check } from "lucide-react";
import HeroBlobCanvas from "../HeroBlobCanvas";
import { getStats, createEndpointOnBackend } from "@/lib/api";
import { toast } from "sonner";

const PHRASES = ["Mock your endpoints.", "Test your UI now.", "Ship faster."];

const Typewriter = () => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIdx];
    const speed = deleting ? 40 : 75;
    const t = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) {
          setTimeout(() => setDeleting(true), 1400);
        }
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next.length === 0) {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % PHRASES.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, phraseIdx]);

  return (
    <span className="text-gradient-brand font-semibold">
      {text}
      <span className="inline-block w-[2px] h-[1em] -mb-1 bg-primary-glow ml-0.5 animate-blink align-middle" />
    </span>
  );
};

const Counter = ({ initialValue = 0, fetchFn, suffix = "", duration = 1400 }: { initialValue?: number; fetchFn?: () => Promise<number>; suffix?: string; duration?: number }) => {
  const [val, setVal] = useState(0);
  const [target, setTarget] = useState(initialValue);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (fetchFn) {
      fetchFn().then(n => {
        setTarget(n);
        // Live incrementing simulation
        setInterval(() => {
          setTarget(prev => prev + (Math.random() > 0.7 ? 1 : 0));
        }, 3000);
      });
    }
  }, [fetchFn]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // We update the animated value whenever 'target' changes, but only if we've intersected
    const startAnimation = (endVal: number) => {
      const start = performance.now();
      const startVal = val;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(startVal + (endVal - startVal) * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            startAnimation(target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (started.current) {
      // If already started and target changed (e.g. live tick), just animate to new target
      startAnimation(target);
    } else {
      obs.observe(el);
    }
    
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

const InlineTryIt = () => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await createEndpointOnBackend({
        id: "temp",
        payload: '{\n  "message": "Hello from MockDrop!"\n}',
        status: 200,
        delay: 0,
        cors: true,
        expiry: "1h",
        createdAt: new Date().toISOString()
      }, "demo-try-it");
      
      setUrl(res.url || null);
      toast.success("Mock API generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate mock API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 relative rounded-lg border border-border/50 bg-black/40 backdrop-blur-sm p-4 w-full max-w-lg mx-auto md:mx-0 overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-mono">response.json</span>
      </div>
      <pre className="text-sm text-slate-300 font-mono bg-black/50 p-3 rounded rounded-b-none border border-border/30 border-b-0">
        <code>{`{\n  "message": "Hello from MockDrop!"\n}`}</code>
      </pre>
      <div className="flex items-center bg-black/80 border border-border/30 p-2 rounded-b">
        {url ? (
          <div className="flex-1 flex items-center justify-between bg-primary/10 text-primary-glow px-3 py-1.5 rounded border border-primary/20 text-sm overflow-hidden">
            <span className="truncate mr-2 font-mono">{url}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-1 hover:bg-primary/20 rounded transition-colors flex-shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-1.5 rounded transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
            Generate Mock API
          </button>
        )}
      </div>
    </div>
  );
};

export const Hero = () => {
  const badgeRef = useRef(null);
  const h1Ref = useRef(null);
  const subRef = useRef(null);
  const statsRef = useRef(null);
  const ctasRef = useRef(null);

  const scrollToEditor = () => {
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#05010D', display: 'flex', flexDirection: 'column' }}
      className="pt-32 pb-20 md:pt-40 md:pb-28"
    >
      <HeroBlobCanvas textRefs={{ badgeRef, h1Ref, subRef, ctasRef, statsRef }} />
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="mx-auto max-w-3xl text-center md:text-left md:mx-0">
          <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Now in public beta — Free forever
          </div>

          <h1 ref={h1Ref} className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-slate-200">
            The fastest way to{" "}
            <span className="text-gradient-brand">mock an API</span>{" "}
            endpoint
          </h1>

          <p ref={subRef} className="mt-6 text-lg md:text-xl text-muted-foreground min-h-[2em]">
            <Typewriter />
          </p>

          <div ref={statsRef} className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
            <StatPill icon={<Activity className="h-3.5 w-3.5 text-success" />} label={<><Counter fetchFn={async () => (await getStats()).total_requests_served} initialValue={2847} /> mock requests served</>} />
            <StatPill icon={<Clock className="h-3.5 w-3.5" />} label={<><Counter initialValue={10} />ms response time</>} />
            <StatPill icon={<InfinityIcon className="h-3.5 w-3.5" />} label="Unlimited endpoints" />
          </div>

          <div ref={ctasRef} className="mt-10 flex justify-center md:justify-start">
            <button
              onClick={scrollToEditor}
              className="btn-primary group inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-base font-semibold"
            >
              Enter Workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <InlineTryIt />
        </div>
      </div>
    </section>
  );
};

const StatPill = ({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur">
    <span className="text-primary-glow">{icon}</span>
    {label}
  </div>
);
