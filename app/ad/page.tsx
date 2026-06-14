import {
  Search,
  ShieldCheck,
  FileWarning,
  Gauge,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

/**
 * Paid-social ad-creative export gallery.
 *
 * Each creative renders at TRUE pixel dimensions so it can be screenshotted /
 * captured at native resolution for ad platforms:
 *   - Square  1080×1080  (Instagram/Facebook feed)
 *   - Story   1080×1920  (Stories / Reels / TikTok)
 *
 * Two message concepts:
 *   - "trust" — leads on the real data layers (NMVTIS/NHTSA), premium framing
 *   - "price" — leads on the $0.50/report hook for performance campaigns
 *
 * To export: open /ad, screenshot each framed canvas (or use a headless
 * screenshot of the element by id, e.g. #ad-square-trust).
 */

const dataPoints = [
  { icon: ShieldCheck, label: 'NMVTIS Verified', accent: 'text-emerald-400', ring: 'border-emerald-500/20 bg-emerald-500/10' },
  { icon: FileWarning, label: 'Recall Checks', accent: 'text-amber-400', ring: 'border-amber-500/20 bg-amber-500/10' },
  { icon: Gauge, label: 'Odometer Audit', accent: 'text-sky-400', ring: 'border-sky-500/20 bg-sky-500/10' },
  { icon: TrendingUp, label: 'Live Market Value', accent: 'text-indigo-400', ring: 'border-indigo-500/20 bg-indigo-500/10' },
];

function Logo({ scale = 1 }: { scale?: number }) {
  return (
    <div className="flex items-center gap-3" style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/25">
        <Search className="w-6 h-6 text-[#6366f1]" strokeWidth={1} />
      </div>
      <span className="text-white font-medium text-2xl tracking-tight">AutoTrace</span>
    </div>
  );
}

/** Shared brand background: OLED black + float orbs + grain. */
function AdBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] aspect-square rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[55%] aspect-square rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-[45%] left-[40%] w-[35%] aspect-square rounded-full bg-blue-600/10 blur-[100px]" />
      </div>
      <div className="noise-overlay absolute inset-0 opacity-60" />
    </>
  );
}

function TrustCreative({ format }: { format: 'square' | 'story' }) {
  const isStory = format === 'story';
  return (
    <div className={`relative z-10 flex flex-col ${isStory ? 'p-20 justify-between' : 'p-16 justify-between'} h-full`}>
      <Logo scale={isStory ? 1.4 : 1.15} />

      <div className={isStory ? 'mt-0' : 'mt-2'}>
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] font-medium bg-white/5 border border-white/10 text-white/55">
          Vehicle History Reports
        </span>
        <h1 className={`mt-8 font-bold tracking-tight text-white leading-[1.05] ${isStory ? 'text-[88px]' : 'text-[68px]'}`}>
          Know before
          <br />
          you{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            buy.
          </span>
        </h1>
        <p className={`mt-7 text-white/45 leading-relaxed ${isStory ? 'text-3xl max-w-2xl' : 'text-2xl max-w-xl'}`}>
          VIN-level intelligence from NHTSA &amp; NMVTIS — title fraud, recalls, and hidden damage, surfaced in seconds.
        </p>

        <div className={`mt-10 grid grid-cols-2 gap-4 ${isStory ? 'max-w-2xl' : 'max-w-xl'}`}>
          {dataPoints.map(({ icon: Icon, label, accent, ring }) => (
            <div key={label} className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${ring}`}>
              <Icon className={`w-7 h-7 shrink-0 ${accent}`} strokeWidth={1} />
              <span className="text-white/85 font-medium text-lg">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-3 rounded-full bg-white text-black font-semibold px-8 py-4 text-xl">
          Run a VIN
          <span className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" strokeWidth={1} />
          </span>
        </span>
        <span className="text-white/40 text-lg tracking-tight">apexportfolio.me</span>
      </div>
    </div>
  );
}

function PriceCreative({ format }: { format: 'square' | 'story' }) {
  const isStory = format === 'story';
  const bullets = ['Branded title detection', 'Hidden accident history', 'Odometer rollback alerts'];
  return (
    <div className={`relative z-10 flex flex-col ${isStory ? 'p-20 justify-between' : 'p-16 justify-between'} h-full`}>
      <Logo scale={isStory ? 1.4 : 1.15} />

      <div>
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] font-medium bg-white/5 border border-white/10 text-white/55">
          Full report
        </span>
        <div className="mt-8 flex items-end gap-4">
          <span className={`font-bold tracking-tight bg-gradient-to-br from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent ${isStory ? 'text-[150px] leading-[0.9]' : 'text-[120px] leading-[0.9]'}`}>
            $0.50
          </span>
          <span className={`text-white/40 font-medium pb-4 ${isStory ? 'text-3xl' : 'text-2xl'}`}>
            / report
          </span>
        </div>
        <p className={`mt-4 text-white/45 leading-relaxed ${isStory ? 'text-3xl max-w-2xl' : 'text-2xl max-w-xl'}`}>
          Every VIN. Real DMV, title, and auction data — no subscription.
        </p>

        <ul className={`mt-10 space-y-4 ${isStory ? 'max-w-2xl' : 'max-w-xl'}`}>
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5">
              <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" strokeWidth={1} />
              <span className="text-white/85 font-medium text-xl">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-3 rounded-full bg-white text-black font-semibold px-8 py-4 text-xl">
          Check any VIN
          <span className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" strokeWidth={1} />
          </span>
        </span>
        <span className="text-white/40 text-lg tracking-tight">apexportfolio.me</span>
      </div>
    </div>
  );
}

const DIMS = {
  square: { width: 1080, height: 1080, label: '1080 × 1080 — Feed (1:1)' },
  story: { width: 1080, height: 1920, label: '1080 × 1920 — Story / Reels (9:16)' },
} as const;

function Frame({
  id,
  format,
  concept,
}: {
  id: string;
  format: 'square' | 'story';
  concept: 'trust' | 'price';
}) {
  const d = DIMS[format];
  return (
    <div className="flex flex-col gap-3">
      <span className="text-white/50 text-sm font-mono">
        #{id} · {concept} · {d.label}
      </span>
      <div
        id={id}
        className="relative overflow-hidden rounded-[40px] border border-white/10"
        style={{ width: d.width, height: d.height, fontFamily: 'var(--font-geist-sans)' }}
      >
        <AdBackdrop />
        {concept === 'trust' ? <TrustCreative format={format} /> : <PriceCreative format={format} />}
      </div>
    </div>
  );
}

export default function AdGalleryPage() {
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] px-8 py-32" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="max-w-[1200px] mx-auto mb-12">
        <h1 className="text-white text-3xl font-bold tracking-tight">Ad Creatives</h1>
        <p className="text-white/45 mt-2 text-lg">
          Rendered at native resolution. Screenshot each canvas (or capture the element by its{' '}
          <code className="text-white/70">#id</code>) to export PNGs for paid social.
        </p>
      </div>

      <div className="flex flex-col items-start gap-20">
        <div className="flex flex-wrap gap-16">
          <Frame id="ad-square-trust" format="square" concept="trust" />
          <Frame id="ad-square-price" format="square" concept="price" />
        </div>
        <div className="flex flex-wrap gap-16">
          <Frame id="ad-story-trust" format="story" concept="trust" />
          <Frame id="ad-story-price" format="story" concept="price" />
        </div>
      </div>
    </main>
  );
}
