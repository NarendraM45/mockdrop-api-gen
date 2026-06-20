import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { RocketIcon } from "@/components/svg/RocketIcon";
import { BadgeIcon } from "@/components/svg/BadgeIcon";
import { HourglassIcon } from "@/components/svg/HourglassIcon";
import { ShieldIcon } from "@/components/svg/ShieldIcon";
import { Globe, Link as ChainIcon, AlertCircle, ArrowRightLeft, RefreshCw, Server, Laptop } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const BaseCard = ({ title, desc, delay, icon: Icon, children }: any) => {
  const { ref, isVisible } = useScrollReveal({ once: true, delay });
  return (
    <Card
      ref={ref as any}
      className={`group feature-card relative rounded-lg bg-surface hover:bg-elevated hover:border-primary/40 transition-all overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6 relative z-10 flex flex-col h-full">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary-glow group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{desc}</p>
        <div className="mt-auto h-32 rounded bg-black/50 border border-border/30 p-3 overflow-hidden flex flex-col justify-center relative">
          {children}
        </div>
      </div>
    </Card>
  );
};

export const ZeroSetupCard = ({ delay }: { delay: number }) => {
  const [text, setText] = useState("");
  const fullText = `{\n  "status": "ok"\n}`;
  const [showUrl, setShowUrl] = useState(false);

  useEffect(() => {
    let i = 0;
    let t: any;
    const type = () => {
      setText(fullText.slice(0, i));
      if (i < fullText.length) {
        i++;
        t = setTimeout(type, 80);
      } else {
        t = setTimeout(() => {
          setShowUrl(true);
          setTimeout(() => {
            setShowUrl(false);
            i = 0;
            type();
          }, 3000);
        }, 500);
      }
    };
    type();
    return () => clearTimeout(t);
  }, []);

  return (
    <BaseCard title="Zero Setup" desc="No server, no config files. Paste JSON and go." icon={RocketIcon} delay={delay}>
      <pre className="text-xs text-slate-300 font-mono"><code>{text}<span className="animate-blink bg-primary w-1.5 h-3 inline-block ml-0.5 align-middle"/></code></pre>
      {showUrl && (
        <div className="absolute bottom-2 right-2 left-2 bg-success/10 text-success border border-success/20 rounded p-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2">
          mockdrop.duckdns.org/api/a1b2c3d4e5
        </div>
      )}
    </BaseCard>
  );
};

export const CustomStatusCard = ({ delay }: { delay: number }) => {
  const codes = [200, 201, 204, 400, 401, 403, 404, 500];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % codes.length);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const color = codes[idx] < 300 ? "text-success" : codes[idx] < 500 ? "text-warning" : "text-destructive";

  return (
    <BaseCard title="Custom Status Codes" desc="Simulate 404s, 500s, 401s — anything you need to test." icon={BadgeIcon} delay={delay}>
      <div className="flex items-center justify-center h-full gap-3">
        <span className="text-muted-foreground font-mono text-xs">HTTP/1.1</span>
        <div className="relative h-10 w-16 overflow-hidden">
          {codes.map((c, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono transition-transform duration-500 ${color}`}
              style={{ transform: `translateY(${(i - idx) * 100}%)` }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  );
};

export const ResponseDelayCard = ({ delay }: { delay: number }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = performance.now();
    let id: number;
    const duration = 2000;
    
    const animate = (now: number) => {
      let p = (now - start) / duration;
      if (p > 1) {
        p = 0;
        start = now;
      }
      setProgress(p * 100);
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <BaseCard title="Response Delay" desc="Add up to 3 seconds of delay to test your loading states." icon={HourglassIcon} delay={delay}>
      <div className="flex flex-col items-center justify-center w-full px-4 gap-2">
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-[10px] font-mono text-muted-foreground text-center">
          Simulating {Math.round((progress / 100) * 3000)}ms latency...
        </div>
      </div>
    </BaseCard>
  );
};

export const LiveValidationCard = ({ delay }: { delay: number }) => {
  const [hasError, setHasError] = useState(false);
  const [text, setText] = useState('{\n  "name": "John"\n  "age": 30\n}');

  useEffect(() => {
    let t: any;
    const loop = () => {
      setHasError(false);
      setText('{\n  "name": "John",\n  "age": 30\n}');
      
      t = setTimeout(() => {
        // Simulate typo by removing the comma
        setText('{\n  "name": "John"\n  "age": 30\n}');
        setTimeout(() => setHasError(true), 200); // instantly pop error
        
        t = setTimeout(loop, 2500);
      }, 1500);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  return (
    <BaseCard title="Live Validation" desc="Invalid JSON is caught before saving — line numbers and all." icon={ShieldIcon} delay={delay}>
      <div className="relative h-full flex flex-col justify-center">
        <pre className="text-xs text-slate-300 font-mono">
          <code>
            {`{\n  "name": "John"`}
            <span className={`relative inline-block transition-colors ${hasError ? 'text-destructive underline decoration-wavy decoration-destructive underline-offset-4' : ''}`}>
              {hasError ? '' : ','}
            </span>
            {`\n  "age": 30\n}`}
          </code>
        </pre>
        {hasError && (
          <div className="absolute top-0 right-0 bg-destructive/10 text-destructive border border-destructive/20 rounded px-2 py-1 text-[10px] font-mono animate-in fade-in zoom-in flex items-center gap-1 shadow-glow shadow-destructive/20">
            <AlertCircle className="h-3 w-3" />
            Expected comma
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export const CorsReadyCard = ({ delay }: { delay: number }) => {
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSending(true);
      setTimeout(() => setSending(false), 1500);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <BaseCard title="CORS Ready" desc="Allow-any-origin headers built in. Works from any frontend." icon={Globe} delay={delay}>
      <div className="flex items-center justify-between h-full px-2">
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="bg-surface border border-border p-2 rounded shadow-lg">
            <Laptop className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground">localhost:3000</span>
        </div>
        
        <div className="flex-1 relative flex items-center justify-center h-full">
          <div className="absolute w-full h-[1px] bg-border/50 border-dashed border-t border-border/50" />
          {sending && (
            <div className="absolute z-20 h-2 w-4 bg-primary rounded-full shadow-glow animate-[slideRight_1.5s_ease-in-out_infinite]" />
          )}
          {sending && (
             <div className="absolute top-1 text-[8px] font-mono text-success animate-in fade-in zoom-in duration-300 delay-700">200 OK</div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 z-10">
          <div className="bg-surface border border-primary/30 p-2 rounded shadow-glow">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[9px] font-mono text-primary-glow">mockdrop.api</span>
        </div>
      </div>
    </BaseCard>
  );
};

export const PersistentUrlCard = ({ delay }: { delay: number }) => {
  return (
    <BaseCard title="Persistent URLs" desc="Endpoints survive page reloads. Share them with your team." icon={ChainIcon} delay={delay}>
      <div className="flex flex-col items-center justify-center h-full gap-4 relative">
        <div className="bg-black/80 border border-border/50 text-slate-300 px-3 py-2 rounded-md text-xs font-mono w-full text-center relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_2s_infinite]" />
          mockdrop.duckdns.org/api/x9f2a
        </div>
        <div className="flex items-center gap-2 text-muted-foreground group">
          <RefreshCw className="h-4 w-4 animate-spin-slow text-primary" style={{ animationDuration: '3s' }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Survives Reloads</span>
        </div>
      </div>
    </BaseCard>
  );
};
