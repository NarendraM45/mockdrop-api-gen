import { useEffect, useMemo, useRef, useState } from "react";
import {
  Wand2,
  Trash2,
  FileCode,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Copy,
  ExternalLink,
  Eye,
  X,
  QrCode,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const EXAMPLE = `{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "admin",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "createdAt": "2026-04-01T12:00:00Z"
}`;

type Endpoint = {
  id: string;
  url: string;
  label: string;
  status: number;
  expiry: string;
  delay: number;
  cors: boolean;
  createdAt: number;
};

type Validation = { valid: boolean; message: string; line?: number };

function validateJson(input: string): Validation {
  if (!input.trim()) return { valid: false, message: "Empty payload" };
  try {
    JSON.parse(input);
    return { valid: true, message: "Valid JSON" };
  } catch (err) {
    const msg = (err as Error).message;
    const m = msg.match(/position (\d+)/);
    let line: number | undefined;
    if (m) {
      const pos = parseInt(m[1], 10);
      line = input.slice(0, pos).split("\n").length;
    }
    return { valid: false, message: line ? `Invalid JSON — check line ${line}` : "Invalid JSON", line };
  }
}

const STORAGE_KEY = "mockdrop:endpoint";

export const Editor = ({ onCreated }: { onCreated?: (e: Endpoint) => void }) => {
  const [json, setJson] = useState(EXAMPLE);
  const [label, setLabel] = useState("");
  const [expiry, setExpiry] = useState("Never");
  const [status, setStatus] = useState(200);
  const [delay, setDelay] = useState(0);
  const [cors, setCors] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validation = useMemo(() => validateJson(json), [json]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEndpoint(JSON.parse(raw));
    } catch {}
  }, []);

  // Cmd/Ctrl + Enter to generate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.valid, json, label, expiry, status, delay, cors]);

  const lineCount = json.split("\n").length;

  const handleFormat = () => {
    try {
      setJson(JSON.stringify(JSON.parse(json), null, 2));
      toast.success("JSON formatted");
    } catch {
      toast.error("Cannot format invalid JSON");
    }
  };

  const handleClear = () => {
    setJson("");
    textareaRef.current?.focus();
  };

  const handleLoadExample = () => {
    setJson(EXAMPLE);
    toast("Example payload loaded");
  };

  const handleGenerate = () => {
    if (!validation.valid) {
      toast.error("Invalid JSON detected");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const hash = Math.random().toString(36).slice(2, 10);
      const ep: Endpoint = {
        id: hash,
        url: `https://api.mockdrop.dev/v1/${hash}`,
        label: label || "Untitled endpoint",
        status,
        expiry,
        delay,
        cors,
        createdAt: Date.now(),
      };
      setEndpoint(ep);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ep)); } catch {}
      onCreated?.(ep);
      console.log("[MockDrop] Endpoint created:", ep);
      toast.success("Endpoint created!");
      setGenerating(false);
    }, 800);
  };

  return (
    <section id="editor" className="relative py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">The Editor</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
            Build a mock endpoint in seconds
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Paste your JSON, choose how it behaves, and get a live URL you can hit from anywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — JSON */}
          <div className="rounded-lg card-border bg-surface p-5 md:p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/15 text-primary-glow px-2.5 py-0.5 text-xs font-semibold">
                  Step 1
                </span>
                <h3 className="text-base font-semibold">Paste your JSON</h3>
              </div>
              <div className="flex items-center gap-1">
                <ToolbarBtn onClick={handleFormat} icon={<Wand2 className="h-3.5 w-3.5" />} label="Format" />
                <ToolbarBtn onClick={handleClear} icon={<Trash2 className="h-3.5 w-3.5" />} label="Clear" />
                <ToolbarBtn onClick={handleLoadExample} icon={<FileCode className="h-3.5 w-3.5" />} label="Example" />
              </div>
            </div>

            <div className="rounded-md card-border bg-[#0d1117] focus-glow transition-all overflow-hidden">
              <div className="flex">
                <div
                  aria-hidden
                  className="select-none px-3 py-3 text-right text-xs font-mono text-muted-foreground/60 border-r border-white/5 bg-black/20"
                  style={{ minWidth: 44 }}
                >
                  {Array.from({ length: Math.max(lineCount, 12) }).map((_, i) => (
                    <div key={i} className="leading-5">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  spellCheck={false}
                  className="flex-1 min-h-[320px] resize-y bg-transparent p-3 font-mono text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground/50"
                  placeholder='{ "hello": "world" }'
                />
              </div>
            </div>

            <ValidationBar v={validation} />
          </div>

          {/* RIGHT — Options */}
          <div className="rounded-lg card-border bg-surface p-5 md:p-6 animate-fade-in stagger-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-semibold">
                Step 2
              </span>
              <h3 className="text-base font-semibold">Configure</h3>
            </div>

            <div className="space-y-5">
              <Field label="Endpoint label" hint="Optional — makes it easier to find later">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. User Profile Response"
                  className="w-full rounded-md card-border bg-elevated px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry">
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-md card-border bg-elevated px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
                  >
                    <option>Never</option>
                    <option>1 hour</option>
                    <option>24 hours</option>
                    <option>7 days</option>
                  </select>
                </Field>

                <Field label="HTTP Status">
                  <input
                    type="number"
                    value={status}
                    onChange={(e) => setStatus(parseInt(e.target.value) || 200)}
                    min={100}
                    max={599}
                    className="w-full rounded-md card-border bg-elevated px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </Field>
              </div>

              <Field label={<>Simulated Delay <span className="text-primary-glow font-mono">{delay}ms</span></>}>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/70 mt-1 font-mono">
                  <span>0ms</span><span>1000ms</span><span>2000ms</span><span>3000ms</span>
                </div>
              </Field>

              <div className="flex items-start justify-between rounded-md card-border bg-elevated p-3">
                <div className="pr-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    CORS
                    <span title="Allows your endpoint to be called from any frontend origin (Access-Control-Allow-Origin: *)">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow requests from any origin
                  </p>
                </div>
                <Toggle on={cors} onChange={setCors} />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!validation.valid || generating}
              className="mt-6 btn-primary w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate Endpoint
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground/70 mt-2 font-mono">
              ⌘ / Ctrl + Enter
            </p>
          </div>
        </div>

        {endpoint && (
          <ResultCard
            endpoint={endpoint}
            onDelete={() => {
              setEndpoint(null);
              try { localStorage.removeItem(STORAGE_KEY); } catch {}
              toast("Endpoint deleted");
            }}
          />
        )}
      </div>
    </section>
  );
};

const ToolbarBtn = ({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
  >
    {icon}
    {label}
  </button>
);

const ValidationBar = ({ v }: { v: Validation }) => (
  <div
    key={v.message}
    className={`mt-3 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium animate-fade-in ${
      v.valid
        ? "bg-success/10 text-success border border-success/20"
        : "bg-destructive/10 text-destructive border border-destructive/20"
    }`}
  >
    {v.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
    {v.message}
  </div>
);

const Field = ({ label, hint, children }: { label: React.ReactNode; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1 text-[11px] text-muted-foreground/70">{hint}</p>}
  </div>
);

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!on)}
    role="switch"
    aria-checked={on}
    className={`relative h-6 w-11 rounded-full transition-colors ${
      on ? "bg-gradient-primary" : "bg-elevated border border-border"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
        on ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const ResultCard = ({ endpoint, onDelete }: { endpoint: Endpoint; onDelete: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(endpoint.url);
    setCopied(true);
    setPulse(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 1800);
    setTimeout(() => setPulse(false), 1000);
  };

  return (
    <div className="mt-8 animate-slide-up-spring">
      <div className="relative rounded-lg card-border bg-gradient-to-br from-surface to-elevated p-5 md:p-7 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary opacity-15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-success font-semibold">Live endpoint</span>
              <span className="text-xs text-muted-foreground">· {endpoint.label}</span>
            </div>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Delete
            </button>
          </div>

          <div className="rounded-md card-border bg-[#0d1117] p-4 font-mono text-sm md:text-base break-all">
            <span className="text-muted-foreground">GET </span>
            <span className="text-foreground">{endpoint.url}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionBtn onClick={handleCopy} pulse={pulse} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
              {copied ? "Copied!" : "Copy URL"}
            </ActionBtn>
            <ActionBtn onClick={() => window.open(endpoint.url, "_blank")} icon={<ExternalLink className="h-4 w-4" />}>
              Open in Browser
            </ActionBtn>
            <ActionBtn onClick={() => toast("Raw view coming soon")} icon={<Eye className="h-4 w-4" />}>
              View Raw
            </ActionBtn>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <Chip>0 requests served</Chip>
            <Chip>Expires: {endpoint.expiry}</Chip>
            <Chip>Status: {endpoint.status}</Chip>
            <Chip>Delay: {endpoint.delay}ms</Chip>
            <Chip>{endpoint.cors ? "CORS: ✓" : "CORS: ✗"}</Chip>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-5 items-center pt-5 border-t border-white/5">
            <div className="flex h-[140px] w-[140px] items-center justify-center rounded-md card-border bg-elevated mx-auto sm:mx-0">
              <QrCode className="h-16 w-16 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-semibold">Scan to open</p>
              <p className="text-xs text-muted-foreground mt-1">
                Quickly test your endpoint from a mobile device or share with your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({
  onClick,
  icon,
  children,
  pulse,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  pulse?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-md card-border bg-elevated px-3.5 py-2 text-sm font-medium hover:bg-elevated/70 hover:border-primary/40 transition-all ${
      pulse ? "animate-pulse-glow" : ""
    }`}
  >
    {icon}
    {children}
  </button>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full card-border bg-background/50 px-2.5 py-1 text-muted-foreground font-mono">
    {children}
  </span>
);
