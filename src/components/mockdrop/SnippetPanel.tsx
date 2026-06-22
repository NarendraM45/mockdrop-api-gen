import { useMemo, useState, useEffect } from "react";
import { Copy, Check, Code2, Monitor, Apple, Terminal } from "lucide-react";
import type { Endpoint } from "@/lib/mockdrop/store";
import {
  buildSnippet,
  langsForOs,
  detectOs,
  type SnippetLang,
  type OS,
} from "@/lib/mockdrop/snippets";
import { toast } from "sonner";

const OS_OPTIONS: { id: OS; label: string; icon: React.ReactNode }[] = [
  { id: "windows", label: "Windows", icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: "macos", label: "macOS", icon: <Apple className="h-3.5 w-3.5" /> },
  { id: "linux", label: "Linux", icon: <Terminal className="h-3.5 w-3.5" /> },
];

export const SnippetPanel = ({ endpoint }: { endpoint: Endpoint }) => {
  const [os, setOs] = useState<OS>(detectOs());
  const langs = useMemo(() => langsForOs(os), [os]);
  const [lang, setLang] = useState<SnippetLang>(langs[0].id);
  const [copied, setCopied] = useState(false);

  // If current lang isn't available for the chosen OS, fall back to first valid
  useEffect(() => {
    if (!langs.find((l) => l.id === lang)) setLang(langs[0].id);
  }, [langs, lang]);

  const snippet = useMemo(() => buildSnippet(endpoint, lang, os), [endpoint, lang, os]);

  const copy = async () => {
    // IMPORTANT: copy the single-line `copy` variant, NEVER the multi-line display.
    // This is what makes the copied command paste-safe into a real terminal.
    await navigator.clipboard.writeText(snippet.copy);
    setCopied(true);
    toast.success("Snippet copied — paste-safe");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-lg card-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary-glow" />
          <h3 className="text-sm font-semibold">Code snippet</h3>
        </div>
        <button
          onClick={copy}
          className={`inline-flex items-center gap-1.5 rounded-md card-border bg-elevated px-2.5 py-1 text-xs hover:bg-elevated/70 transition-all ${
            copied ? "border-success/60 text-success" : ""
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* OS selector */}
      <div className="px-5 pt-3 pb-2 flex items-center gap-1.5">
        {OS_OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOs(o.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all ${
              os === o.id
                ? "bg-primary/15 border-primary/50 text-primary-glow shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>

      {/* Lang tabs */}
      <div className="px-5 flex gap-1 border-b border-border overflow-x-auto">
        {langs.map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap ${
              lang === l.id
                ? "bg-[#0d1117] text-primary-glow border-b-2 border-primary-glow -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <pre className="bg-[#0d1117] p-4 text-xs font-mono overflow-x-auto max-h-56 overflow-y-auto leading-relaxed whitespace-pre">
        {snippet.display}
      </pre>
      <div className="px-5 py-2 border-t border-border text-[10px] text-muted-foreground bg-elevated/30">
        💡 Copy gives you a single-line command — paste straight into your terminal.
      </div>
    </div>
  );
};
