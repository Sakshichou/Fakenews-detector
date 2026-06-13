import { useMemo, useRef, useState, useEffect } from "react";

type Token = { word: string; score: number; sep: string };
type Result = { label: "fake" | "real"; confidence: number; tokens: Token[] };

const API_URL = "https://chubby-geckos-battle.loca.lt/analyze";

type ApiToken = { word?: string; token?: string; score: number | number[] };
type ApiResponse = {
  prediction: string;
  confidence: number;
  tokens: ApiToken[];
};

async function analyze(text: string): Promise<Result> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data: ApiResponse = await res.json();

  const label: "fake" | "real" =
    String(data.prediction).toUpperCase() === "FAKE" ? "fake" : "real";
  const confidence =
    data.confidence > 1 ? data.confidence / 100 : data.confidence;

  const rawTokens = (data.tokens ?? []).map((t) => {
    let s = 0;
    if (Array.isArray(t.score)) {
      const [fake = 0, real = 0] = t.score;
      s = (real ?? 0) - (fake ?? 0);
    } else if (typeof t.score === "number") {
      s = t.score;
    }
    const raw = t.word ?? t.token ?? "";
    return { word: raw.replace(/\s+$/, ""), score: s, sep: /\s$/.test(raw) ? " " : "" };
  });
  const maxAbs = rawTokens.reduce((m, t) => Math.max(m, Math.abs(t.score)), 0);
  const tokens: Token[] = rawTokens.map((t) => ({
    ...t,
    score: maxAbs > 0 ? t.score / maxAbs : 0,
  }));

  return { label, confidence, tokens };
}

const TEMPLATES = [
  {
    emoji: "📰",
    title: "Factual News",
    sub: "Neutral · safe",
    accent: "teal" as const,
    text: "The official agency released its standard annual economic report today, showing steady growth and aligned market metrics.",
  },
  {
    emoji: "🚨",
    title: "Sensational Clickbait",
    sub: "Vibrant · alert",
    accent: "coral" as const,
    text: "BREAKING: A shocking secret hoax leaked by an anonymous source reveals a global agency has been hiding a miracle cure!",
  },
  {
    emoji: "🧐",
    title: "Tricky / Mixed Context",
    sub: "Curious · warning",
    accent: "amber" as const,
    text: "The city council approved the annual infrastructure budget today, but a shocking rumor suggests they secretly hid millions in a hidden account.",
  },
];

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "FakeShield XAI — Explainable Fake News Verification";
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const r = await analyze(text);
      setResult(r);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reach the analysis backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-20 size-[28rem] bg-[var(--purple-mid)] opacity-30 blur-3xl animate-blob" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-72 size-[26rem] bg-[var(--teal)] opacity-20 blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />
      <div aria-hidden className="pointer-events-none absolute left-1/3 bottom-0 size-[24rem] bg-[var(--coral)] opacity-20 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />

      <main className="relative mx-auto max-w-5xl px-5 pt-16 pb-24 sm:pt-24">
        {/* HERO */}
        <section className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[var(--teal)] animate-glow-soft" /> Explainable AI · Live demo
          </div>
          <h1 className="mt-6 text-5xl sm:text-7xl font-bold leading-[0.95]">
            <span className="inline-block">🛡️</span>{" "}
            <span className="text-foreground">FakeShield XAI</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Spot fake news instantly with AI that shows its work
          </p>

        </section>

        {/* INPUT */}
        <section className="mt-16 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="gradient-border gradient-border-focus rounded-3xl p-1 transition-all">
            <div className="rounded-[1.4rem] bg-[var(--input-bg)] backdrop-blur-xl">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a shocking headline, a suspicious tweet, or a news article here to pull back the curtain..."
                rows={6}
                className="w-full resize-none bg-transparent px-6 py-5 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  {text.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
                  <span className="text-[var(--teal)]">private, runs in-browser</span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || loading}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-glow-teal)] transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="size-2 animate-pulse rounded-full bg-current" />
                        Scanning content…
                      </>
                    ) : (
                      <>⚡ Analyze Content</>
                    )}
                  </span>
                  {loading && (
                    <span className="absolute inset-y-0 left-0 w-1/3 bg-white/40 blur-md animate-scan" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section className="mt-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Try a template</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.title}
                onClick={() => setText(t.text)}
                className="group relative overflow-hidden rounded-2xl glass p-5 text-left transition-all hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_20px_50px_-20px_oklch(0.5_0.2_295/0.5)]"
              >
                <div
                  className="absolute inset-x-0 -top-px h-px opacity-60"
                  style={{
                    background:
                      t.accent === "teal"
                        ? "linear-gradient(90deg, transparent, var(--teal), transparent)"
                        : t.accent === "coral"
                        ? "linear-gradient(90deg, transparent, var(--coral), transparent)"
                        : "linear-gradient(90deg, transparent, oklch(0.8 0.18 75), transparent)",
                  }}
                />
                <div className="text-3xl transition-transform group-hover:scale-110">{t.emoji}</div>
                <div className="mt-3 font-display text-base font-semibold">{t.title}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.sub}</div>
                <div className="mt-3 line-clamp-2 text-xs text-muted-foreground/90">{t.text}</div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--teal)] opacity-0 transition-opacity group-hover:opacity-100">
                  Load template →
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* RESULTS */}
        <section ref={resultsRef} className="mt-16">
          {loading && (
            <div className="glass-strong animate-fade-up rounded-3xl p-10 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
                <div className="relative size-16">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                      borderTopColor: "var(--teal)",
                      borderRightColor: "var(--coral)",
                      animation: "spin 1.1s linear infinite",
                    }}
                  />
                </div>
                <div className="font-display text-lg">Running DistilBERT + SHAP…</div>
                <div className="text-sm text-muted-foreground">Tokenizing · embedding · computing per-word attributions</div>
              </div>
            </div>
          )}

          {result && !loading && <ResultsPanel result={result} />}
          {error && !loading && (
            <div className="glass-strong animate-fade-up rounded-3xl p-6 text-center text-sm" style={{ color: "var(--coral)" }}>
              ⚠️ {error}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>FakeShield XAI — crafted with curiosity.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ResultsPanel({ result }: { result: Result }) {
  const isFake = result.label === "fake";
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Badge */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 ${
          isFake ? "animate-pulse-glow" : "animate-glow-soft"
        }`}
        style={{
          background: isFake ? "var(--gradient-coral)" : "var(--gradient-primary)",
          color: "oklch(0.12 0.04 290)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
              FakeShield verdict
            </div>
            <div className="mt-2 font-display text-3xl sm:text-4xl font-bold">
              {isFake ? "🚨 Deceptive Content" : "✅ Authentic Article"}
            </div>
            <div className="mt-1 text-sm opacity-80">
              {isFake
                ? "Patterns consistent with sensationalized or misleading reporting."
                : "Linguistic signals align with credible, neutral reporting."}
            </div>
          </div>
          <ConfidenceGauge pct={pct} isFake={isFake} />
        </div>
      </div>

      {/* Explainability */}
      <div className="glass-strong rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="size-2.5 rounded-full bg-[oklch(0.74_0.19_20)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.83_0.16_75)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.78_0.16_180)]" />
            <span className="ml-3">shap-explainer · per-token attribution</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hover any word</div>
        </div>
        <div className="p-6 sm:p-8 font-mono text-[15px] leading-[2.1] tracking-wide">
          {result.tokens.map((tok, i) =>
            tok.word ? (
              <HighlightedWord key={i} token={tok} />
            ) : (
              <span key={i}>{tok.sep}</span>
            ),
          )}
        </div>
        <Legend />
      </div>
    </div>
  );
}

function HighlightedWord({ token }: { token: Token }) {
  const { word, score, sep } = token;
  const abs = Math.min(1, Math.abs(score));
  if (abs < 0.15) {
    return (
      <span>
        <span className="text-foreground/85">{word}</span>
        {sep}
      </span>
    );
  }
  const isFake = score < 0;
  const alpha = 0.18 + abs * 0.55;
  const bg = isFake
    ? `oklch(0.74 0.19 20 / ${alpha})`
    : `oklch(0.78 0.16 180 / ${alpha})`;
  const ring = isFake ? "oklch(0.74 0.19 20 / 0.6)" : "oklch(0.78 0.16 180 / 0.6)";

  return (
    <span className="group relative inline-block">
      <span
        className="cursor-help rounded-md px-1.5 py-0.5 transition-all hover:scale-110 hover:shadow-lg"
        style={{ background: bg, boxShadow: `inset 0 0 0 1px ${ring}` }}
      >
        {word}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-xs font-sans shadow-xl ring-1 ring-border group-hover:block">
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">SHAP value</span>
        <span className={`block font-mono ${isFake ? "text-[var(--coral)]" : "text-[var(--teal)]"}`}>
          {score > 0 ? "+" : ""}
          {score.toFixed(3)} · pushes {isFake ? "FAKE" : "REAL"}
        </span>
      </span>
      {sep}
    </span>
  );
}

function Legend() {
  return (
    <div className="border-t border-white/10 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground uppercase tracking-wider">Pushes Fake</span>
          <div className="flex h-3 w-40 overflow-hidden rounded-full ring-1 ring-white/10">
            {[0.2, 0.35, 0.5, 0.65, 0.8].map((a) => (
              <div key={a} className="flex-1" style={{ background: `oklch(0.74 0.19 20 / ${a})` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-40 overflow-hidden rounded-full ring-1 ring-white/10">
            {[0.8, 0.65, 0.5, 0.35, 0.2].map((a) => (
              <div key={a} className="flex-1" style={{ background: `oklch(0.78 0.16 180 / ${a})` }} />
            ))}
          </div>
          <span className="text-muted-foreground uppercase tracking-wider">Pushes Real</span>
        </div>
      </div>
    </div>
  );
}

function ConfidenceGauge({ pct, isFake }: { pct: number; isFake: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = useMemo(() => c - (pct / 100) * c, [c, pct]);
  const stroke = isFake ? "oklch(0.18 0.08 25)" : "oklch(0.18 0.08 200)";
  const fg = isFake ? "oklch(0.25 0.12 25)" : "oklch(0.25 0.12 200)";

  return (
    <div className="relative grid size-32 place-items-center">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke={stroke} strokeWidth="10" opacity="0.4" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={fg}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-3xl font-bold tabular-nums">{pct}%</div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">Confidence</div>
        </div>
      </div>
    </div>
  );
}
