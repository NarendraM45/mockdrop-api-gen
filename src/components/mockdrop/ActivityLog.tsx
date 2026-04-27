import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";

type LogEntry = {
  ts: string;
  hash: string;
  status: number;
  ip: string;
  rt: number;
};

export const ActivityLog = ({ trigger }: { trigger?: number }) => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      // mock data — leave empty most of the time so empty state shows
      setLogs([]);
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <section id="activity" className="relative py-20 md:py-28">
      <div className="container">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">Live</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Recent Activity</h2>
            <p className="mt-2 text-sm text-muted-foreground">Real-time hits to your mock endpoints.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Listening
          </div>
        </div>

        <div className="rounded-lg card-border bg-surface overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1.2fr_0.7fr_1.2fr_0.8fr] gap-4 px-5 py-3 border-b border-white/5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Timestamp</div>
            <div>URL hash</div>
            <div>Status</div>
            <div>IP</div>
            <div className="text-right">Response</div>
          </div>

          {loading ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_1.2fr_0.7fr_1.2fr_0.8fr] gap-4 px-5 py-4">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div
                      key={j}
                      className="h-3 rounded bg-gradient-to-r from-elevated via-white/5 to-elevated bg-[length:200%_100%] animate-shimmer"
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated text-muted-foreground/60 mb-4">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No requests yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Share your URL or hit it from your terminal to see live activity here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((l, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_1.2fr_0.7fr_1.2fr_0.8fr] gap-4 px-5 py-3 text-sm font-mono items-center hover:bg-elevated/40 transition-colors">
                  <div className="text-muted-foreground">{l.ts}</div>
                  <div>{l.hash}</div>
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${l.status < 400 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {l.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground">{l.ip}</div>
                  <div className="text-right">{l.rt}ms</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
