import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle, Phone, Mail, MapPin, Menu, X, ArrowRight,
  ChevronRight, User, Image as ImageIcon,
  PlayCircle, ChevronLeft, Maximize2,
} from "lucide-react";
import { api, type LeadInput } from "./api";
import { AdminModal } from "./admin/AdminPanel";
import {
  DEFAULT_SITE, iconFor, mediaSrc, mergeSite,
  type GalleryItem, type Page, type Project, type SiteData,
} from "./siteData";

// ─── Contenido del sitio (servidor + caché local) ─────────────────────────────
const SITE_CACHE_KEY = "luedmon_site_cache";

function useSite() {
  const [site, setSite] = useState<SiteData>(() => {
    try { return mergeSite(JSON.parse(localStorage.getItem(SITE_CACHE_KEY) ?? "null")); } catch { return DEFAULT_SITE; }
  });
  const update = useCallback((next: SiteData) => {
    setSite(next);
    try { localStorage.setItem(SITE_CACHE_KEY, JSON.stringify(next)); } catch {}
  }, []);
  useEffect(() => {
    api.getSite()
      .then(data => update(mergeSite(data)))
      .catch(() => { /* Sin servidor (p. ej. en desarrollo local): se usa el contenido predeterminado */ });
  }, [update]);
  return [site, update] as const;
}

const telHref = (phone: string) => `tel:+57${phone.replace(/[^\d]/g, "")}`;
const NAV_PAGES: Page[] = ["home", "instalacion", "mantenimiento", "proyectos", "contacto"];
const navItems = (t: SiteData["text"]) => NAV_PAGES.map(page => ({ page, label: t[`nav_${page}` as keyof SiteData["text"]] }));

// ─── Custom Hooks ─────────────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(end: number, dur = 1800, trigger = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setVal(Math.round((1 - (1 - p) ** 4) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, end, dur]);
  return val;
}

function useTypewriter(phrases: string[], speed = 90) {
  const [text, setText] = useState("");
  const s = useRef({ p: 0, c: 0, del: false, wait: false });
  useEffect(() => {
    const id = setInterval(() => {
      if (s.current.wait) return;
      const cur = phrases[s.current.p % Math.max(phrases.length, 1)] ?? "";
      if (!s.current.del) {
        s.current.c++;
        setText(cur.slice(0, s.current.c));
        if (s.current.c >= cur.length) {
          s.current.wait = true;
          setTimeout(() => { s.current.wait = false; s.current.del = true; }, 2800);
        }
      } else {
        s.current.c = Math.max(0, s.current.c - 1);
        setText(cur.slice(0, s.current.c));
        if (s.current.c === 0) {
          s.current.del = false;
          s.current.p = (s.current.p + 1) % Math.max(phrases.length, 1);
        }
      }
    }, s.current.del ? speed * 0.45 : speed);
    return () => clearInterval(id);
  }, [phrases, speed]);
  return text;
}

// ─── Animation Styles ─────────────────────────────────────────────────────────
const CSS_ANIMS = `
  @keyframes scanLine { 0%{top:-2px;opacity:.8} 100%{top:100%;opacity:0} }
  @keyframes radarPing { 0%{transform:translate(-50%,-50%) scale(.5);opacity:.7} 100%{transform:translate(-50%,-50%) scale(4);opacity:0} }
  @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes glitch {
    0%,88%,100%{clip-path:none;transform:skewX(0)}
    89%{clip-path:inset(10% 0 75% 0);transform:skewX(-10deg) translateX(-6px)}
    90%{clip-path:inset(60% 0 8% 0);transform:skewX(10deg) translateX(6px)}
    91%{clip-path:none;transform:skewX(0)}
  }
  @keyframes shimmer {
    0%{background-position:-400% center}
    100%{background-position:400% center}
  }
  @keyframes borderPulse {
    0%,100%{border-color:rgba(0,242,255,.1)}
    50%{border-color:rgba(0,242,255,.55);box-shadow:0 0 24px rgba(0,242,255,.1)}
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeLeft { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeRight { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
  @keyframes typeCursor { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes dataStream {
    0%{transform:translateY(-120%);opacity:0}
    5%,92%{opacity:.18}
    100%{transform:translateY(100vh);opacity:0}
  }
  .anim-scan { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(0,242,255,.6),transparent); animation:scanLine 4s linear infinite; }
  .anim-float { animation:floatY 5s ease-in-out infinite; }
  .anim-glitch { animation:glitch 8s ease infinite; }
  .anim-shimmer-text {
    background:linear-gradient(90deg,rgba(0,242,255,.5),rgba(0,242,255,1) 40%,rgba(0,242,255,.5) 60%,rgba(0,242,255,1));
    background-size:400% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    animation:shimmer 3s linear infinite;
  }
  .anim-border-pulse { animation:borderPulse 3s ease-in-out infinite; }
  .cursor-blink { animation:typeCursor .8s step-end infinite; }
  .anim-rotate { animation:rotateSlow 18s linear infinite; }
`;

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas({ density = 55 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const dpr = Math.min(devicePixelRatio, 2);
    const resize = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const pts = Array.from({ length: density }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.4 + .4,
      o: Math.random() * .4 + .25,
    }));

    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,242,255,${p.o})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length - 1; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 125) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,242,255,${(1 - d / 125) * .22})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [density]);
  return <canvas ref={ref} className="absolute inset-0" style={{ width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── Reveal Component ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, from = "bottom", className = "" }: {
  children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right"; className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  const transforms: Record<string, string> = {
    bottom: visible ? "translateY(0)" : "translateY(28px)",
    left: visible ? "translateX(0)" : "translateX(-28px)",
    right: visible ? "translateX(0)" : "translateX(28px)",
  };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: transforms[from],
      transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
    }}>{children}</div>
  );
}

// ─── Tilt Card ────────────────────────────────────────────────────────────────
function TiltCard({ children, className = "", style = {}, onClick }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .5) * 14;
    const y = ((e.clientY - r.top) / r.height - .5) * -14;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) scale(1.025)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className={className} style={{ ...style, transition: "transform .18s ease", transformStyle: "preserve-3d" }}
      onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick}
      role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}>
      {children}
    </div>
  );
}

// ─── Shield Logo ──────────────────────────────────────────────────────────────
function ShieldLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.16)} viewBox="0 0 44 51" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L41 10.5V27.5C41 40.5 30.5 48 22 50C13.5 48 3 40.5 3 27.5V10.5Z" fill="url(#lg1)" stroke="#00f2ff" strokeWidth="1.4" />
      <path d="M22 9L36 16V27C36 36 30 43 22 45C14 43 8 36 8 27V16Z" fill="#071626" stroke="#00b4d8" strokeWidth=".7" strokeOpacity=".6" />
      <path d="M22 16L30.5 20.5V27C30.5 32.5 26.5 36 22 37.5C17.5 36 13.5 32.5 13.5 27V20.5Z" fill="none" stroke="#00f2ff" strokeWidth="1" strokeOpacity=".7" />
      <line x1="22" y1="16" x2="22" y2="37.5" stroke="#00f2ff" strokeWidth=".9" strokeOpacity=".35" />
      <line x1="13.5" y1="23" x2="30.5" y2="23" stroke="#00f2ff" strokeWidth=".9" strokeOpacity=".35" />
      <circle cx="22" cy="23" r="2.5" fill="#00f2ff" fillOpacity=".85" />
      <defs>
        <linearGradient id="lg1" x1="22" y1="2" x2="22" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1565c0" />
          <stop offset="1" stopColor="#062040" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ activePage, setPage, site }: { activePage: Page; setPage: (p: Page) => void; site: SiteData }) {
  const t = site.text;
  const NAV_ITEMS = navItems(t);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const nav = (p: Page) => { setPage(p); setOpen(false); window.scrollTo({ top: 0 }); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-400" style={{
      background: scrolled ? "rgba(6,15,30,.94)" : "rgba(6,15,30,.35)",
      backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
      borderBottom: scrolled ? "1px solid rgba(0,242,255,.14)" : "1px solid transparent",
      boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,.4)" : "none",
    }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
        <button onClick={() => nav("home")} className="flex items-center gap-3">
          <img src={mediaSrc(site.media.logo)} alt={t.brandName} className="h-12 w-auto brightness-0 invert" />
          <div>
            <div className="text-white font-bold uppercase text-lg" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.brandName}</div>
            <div className="text-xs text-slate-300" style={{ fontFamily: "'Inter',sans-serif" }}>{t.brandSubtitle}</div>
          </div>
        </button>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(item => (
            <button key={item.page} onClick={() => nav(item.page)} className="text-sm font-medium relative group transition-colors duration-200"
              style={{ color: activePage === item.page ? "#00f2ff" : "rgba(226,232,240,.75)", fontFamily: "'Inter',sans-serif" }}>
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px bg-cyan-400 transition-all duration-300"
                style={{ width: activePage === item.page ? "100%" : "0%" }} />
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href={telHref(t.phone1)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}>
            <Phone size={13} /> {t.phone1.replace(/-/g, " ")}
          </a>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "rgba(0,242,255,.08)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace", border: "1px solid rgba(0,242,255,.15)" }}>
            {t.navStatus}
          </span>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-5 pt-2 space-y-1" style={{ background: "rgba(6,15,30,.98)" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.page} onClick={() => nav(item.page)} className="w-full text-left py-3 px-4 rounded-xl text-sm font-medium"
              style={{ color: activePage === item.page ? "#00f2ff" : "rgba(226,232,240,.8)", background: activePage === item.page ? "rgba(0,242,255,.07)" : "transparent", fontFamily: "'Inter',sans-serif" }}>
              {item.label}
            </button>
          ))}
          <a href={telHref(t.phone1)} className="flex items-center gap-2 py-3 px-4 text-sm font-semibold" style={{ color: "#00f2ff" }}>
            <Phone size={13} /> +57 {t.phone1.replace(/-/g, " ")}
          </a>
        </div>
      )}
    </header>
  );
}

// ─── WhatsApp Float ───────────────────────────────────────────────────────────
function WhatsAppFloat({ site }: { site: SiteData }) {
  const t = site.text;
  const [hov, setHov] = useState(false);
  return (
    <div className="fixed bottom-7 right-7 z-50 flex items-center">
      {hov && (
        <div className="mr-3 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: "rgba(6,15,30,.95)", border: "1px solid rgba(0,242,255,.2)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif", backdropFilter: "blur(12px)", animation: "fadeLeft .2s ease" }}>
          {t.whatsappTooltip}
        </div>
      )}
      <a href={`https://wa.me/${t.whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(t.whatsappMessage)}`} target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="relative flex items-center justify-center rounded-full shadow-2xl transition-transform duration-200 hover:scale-110"
        style={{ width: 56, height: 56, background: "#25d366" }}>
        <span className="absolute inset-0 rounded-full opacity-25" style={{ background: "#00f2ff", animation: "ping 2s cubic-bezier(0,0,.2,1) infinite" }} />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.854L0 24l6.336-1.512A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.573-.487-5.065-1.339l-.363-.214-3.76.897.944-3.654-.237-.375A9.972 9.972 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </a>
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm({ compact = false, site }: { compact?: boolean; site: SiteData }) {
  const t = site.text;
  const [f, setF] = useState<LeadInput>({ nombre: "", empresa: "", correo: "", telefono: "", servicio: "", mensaje: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inp = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all";
  const iS = { background: "rgba(0,242,255,.05)", border: "1px solid rgba(0,242,255,.18)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      await api.submitLead(f);
      setSent(true);
      setF({ nombre: "", empresa: "", correo: "", telefono: "", servicio: "", mensaje: "" });
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError("No pudimos enviar su solicitud. Por favor escríbanos por WhatsApp o llámenos.");
    } finally {
      setSending(false);
    }
  };

  const grid2 = compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className={`grid gap-3 ${grid2}`}>
        <input className={inp} style={iS} placeholder="Nombre *" value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} required />
        <input className={inp} style={iS} placeholder="Empresa" value={f.empresa} onChange={e => setF({ ...f, empresa: e.target.value })} />
      </div>
      <div className={`grid gap-3 ${grid2}`}>
        <input className={inp} style={iS} type="email" placeholder="Correo electrónico *" value={f.correo} onChange={e => setF({ ...f, correo: e.target.value })} required />
        <input className={inp} style={iS} type="tel" placeholder="Teléfono *" value={f.telefono} onChange={e => setF({ ...f, telefono: e.target.value })} required />
      </div>
      <select className={`${inp} text-slate-200`} style={{ ...iS, cursor: "pointer", color: "#e2e8f0" }} value={f.servicio} onChange={e => setF({ ...f, servicio: e.target.value })}>
        <option value="" className="text-slate-200">{t.formServicePlaceholder}</option>
        {site.formServices.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
      </select>
      <textarea className={inp} style={iS} rows={compact ? 3 : 4} placeholder={t.formMessagePlaceholder} value={f.mensaje} onChange={e => setF({ ...f, mensaje: e.target.value })} />
      {error && <p className="text-xs" style={{ color: "#fca5a5", fontFamily: "'Inter',sans-serif" }}>{error}</p>}
      <button type="submit" disabled={sending} className="w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] hover:brightness-110"
        style={{ background: sent ? "#10b981" : "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {sent ? t.formSuccess : sending ? "Enviando…" : t.formSubmit}
      </button>
    </form>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  const t = site.text;
  const [active, setActive] = useState(0);
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const headline = useTypewriter(site.heroPhrases.filter(Boolean), 90);

  const restart = useCallback(() => {
    if (iRef.current) clearInterval(iRef.current);
    iRef.current = setInterval(() => setActive(a => (a + 1) % 3), 12000);
  }, []);

  useEffect(() => { restart(); return () => { if (iRef.current) clearInterval(iRef.current); }; }, [restart]);

  const goTo = (i: number) => { setActive(i); restart(); };

  return (
    <section className="relative min-h-screen flex items-stretch overflow-hidden" style={{ background: "#060f1e", paddingTop: 72 }}>
      {/* Particle canvas */}
      <ParticleCanvas density={60} />

      {/* Scan line */}
      <div className="anim-scan" />

      {/* Radar pulses */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{
            width: 400, height: 400, left: "20%", top: "50%",
            border: "1px solid rgba(0,242,255,.2)",
            animation: `radarPing 4s ease-out ${i * 1.33}s infinite`,
          }} />
      ))}

      {/* Hex decoration */}
      <div className="absolute top-20 right-10 opacity-5 anim-rotate pointer-events-none" style={{ width: 300, height: 300 }}>
        <svg viewBox="0 0 100 100" fill="none" stroke="#00f2ff" strokeWidth=".5">
          <polygon points="50,2 93,26 93,74 50,98 7,74 7,26" />
          <polygon points="50,12 83,31 83,69 50,88 17,69 17,31" />
          <polygon points="50,22 73,36 73,64 50,78 27,64 27,36" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-0 items-center py-16">
        {/* Left: Slider */}
        <div className="lg:col-span-3 relative" onMouseEnter={() => { if (iRef.current) clearInterval(iRef.current); }} onMouseLeave={restart}>
          <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 500, border: "1px solid rgba(0,242,255,.12)", background: "linear-gradient(135deg, rgba(11,26,51,.9) 0%, rgba(6,15,30,.95) 100%)", backdropFilter: "blur(8px)" }}>
            <video key={site.media.heroVideo} src={mediaSrc(site.media.heroVideo)} autoPlay loop muted playsInline aria-hidden="true" className="object-cover absolute inset-0 w-full h-full -z-10" style={{ opacity: 0.1 }} />
            {/* Corner brackets */}
            {[["top-0 left-0 border-l border-t", "rounded-tl-lg"], ["top-0 right-0 border-r border-t", "rounded-tr-lg"], ["bottom-0 left-0 border-l border-b", "rounded-bl-lg"], ["bottom-0 right-0 border-r border-b", "rounded-br-lg"]].map(([pos, r], i) => (
              <span key={i} className={`absolute w-6 h-6 ${pos} ${r}`} style={{ borderColor: "rgba(0,242,255,.4)" }} />
            ))}

            <div className="relative z-10 p-10 md:p-14 flex flex-col justify-center min-h-[500px]">
              {active === 0 && (
                <div className="space-y-5" style={{ animation: "fadeUp .5s ease" }}>
                  <div className="flex items-center gap-3 mb-6">
                    <img src={mediaSrc(site.media.logo)} alt={t.brandName} className="h-16 w-auto brightness-0 invert" />
                    <div>
                      <div className="text-3xl font-black tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.brandName}</div>
                      <div className="text-xs text-slate-200" style={{ fontFamily: "'Inter',sans-serif" }}>{t.brandSubtitle}</div>
                    </div>
                  </div>
                  <div className="text-5xl md:text-6xl font-black leading-none" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    <span className="anim-shimmer-text">{headline || "\u00a0"}</span>
                    <span className="cursor-blink ml-1" style={{ color: "#00f2ff" }}>|</span>
                  </div>
                  <div className="text-xl font-semibold text-slate-100" style={{ fontFamily: "'Inter',sans-serif" }}>{t.heroSubHeadline}</div>
                  <p className="text-sm leading-relaxed max-w-md text-slate-100 font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>{t.heroBody}</p>
                  <div className="flex gap-3 flex-wrap pt-2">
                    <a href={telHref(t.phone1)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:brightness-110"
                      style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      <Phone size={15} /> {t.heroCallBtn}
                    </a>
                    <button className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                      style={{ border: "1px solid rgba(0,242,255,.35)", color: "#00f2ff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                      onClick={() => document.getElementById("contacto-form")?.scrollIntoView({ behavior: "smooth" })}>
                      {t.heroQuoteBtn}
                    </button>
                  </div>
                </div>
              )}

              {active === 1 && (
                <div className="space-y-6" style={{ animation: "fadeUp .5s ease" }}>
                  <div className="text-xs font-bold tracking-[.2em] uppercase" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.slide2Tag}</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.slide2Headline}</h2>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {site.slide2Cards.map((c, i) => { const Icon = iconFor(c.icon); return (
                      <TiltCard key={i} className="flex items-center gap-3 p-4 rounded-2xl anim-border-pulse"
                        style={{ background: "rgba(0,242,255,.04)", border: "1px solid rgba(0,242,255,.12)" }}>
                        <Icon size={20} style={{ color: "#00f2ff" }} />
                        <span className="text-sm font-medium text-slate-100" style={{ fontFamily: "'Inter',sans-serif" }}>{c.label}</span>
                      </TiltCard>
                    ); })}
                  </div>
                  <button onClick={() => setPage("instalacion")} className="px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all"
                    style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {t.slide2Btn}
                  </button>
                </div>
              )}

              {active === 2 && (
                <div className="space-y-5" style={{ animation: "fadeUp .5s ease" }}>
                  <div className="text-xs font-bold tracking-[.2em] uppercase" style={{ color: "#ffb703", fontFamily: "'JetBrains Mono',monospace" }}>{t.slide3Tag}</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {t.slide3Headline.split(" ").slice(0, 3).join(" ")}<br />
                    <span style={{ color: "#ffb703" }}>{t.slide3Headline.split(" ").slice(3).join(" ")}</span>
                  </h2>
                  <p className="text-sm leading-relaxed max-w-md text-slate-100 font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>{t.slide3Body}</p>
                  <div className="flex gap-8">
                    {site.slide3Stats.map((s, i) => (
                      <div key={i}>
                        <div className="text-3xl font-bold" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
                        <div className="text-xs mt-1" style={{ color: "rgba(226,232,240,.5)", fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Slide indicators */}
              <div className="absolute bottom-6 left-10 flex gap-2 items-center">
                {[0, 1, 2].map(i => (
                  <button key={i} onClick={() => goTo(i)} className="h-0.5 rounded-full transition-all duration-500"
                    style={{ width: i === active ? 44 : 18, background: i === active ? "#00f2ff" : "rgba(255,255,255,.2)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact form glass card */}
        <div id="contacto-form" className="lg:col-span-2 lg:pl-6 mt-6 lg:mt-0">
          <div className="rounded-3xl p-7" style={{
            background: "rgba(11,26,51,.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0,242,255,.14)", boxShadow: "0 8px 48px rgba(0,0,0,.5), inset 0 1px 0 rgba(0,242,255,.07)",
          }}>
            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.heroFormTitle}</h3>
            <p className="text-xs mb-5" style={{ color: "rgba(226,232,240,.45)", fontFamily: "'Inter',sans-serif" }}>{t.heroFormSubtitle}</p>
            <ContactForm compact site={site} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sectors Section ──────────────────────────────────────────────────────────
function SectoresSection({ site }: { site: SiteData }) {
  const t = site.text;
  return (
    <section className="py-24 px-6" style={{ background: "#ffffff" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#0b1a33", fontFamily: "'JetBrains Mono',monospace" }}>{t.sectorsTag}</div>
          <h2 className="text-4xl font-extrabold" style={{ color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {t.sectorsTitle}
          </h2>
          <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>
            {t.sectorsSubtitle}
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {site.sectors.map((s, i) => { const Icon = iconFor(s.icon); return (
            <Reveal key={i} delay={i * 100}>
              <TiltCard className="group p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full"
                style={{ background: "#f4f7fc", border: "1px solid #e2e8f0" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-blue-100" style={{ background: "#e8f0fe" }}>
                  <Icon size={22} style={{ color: "#1565c0" }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b", fontFamily: "'Inter',sans-serif" }}>{s.desc}</p>
              </TiltCard>
            </Reveal>
          ); })}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function ImpactStat({ stat, color, visible }: { stat: SiteData["impactStats"][number]; color: string; visible: boolean }) {
  const n = useCountUp(stat.value, 1800, visible);
  return (
    <div>
      <div className="text-7xl font-black leading-none" style={{ color, fontFamily: "'JetBrains Mono',monospace" }}>
        {stat.prefix}{n}{stat.suffix}
      </div>
      <div className="text-sm mt-2" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{stat.label}</div>
    </div>
  );
}

function StatsSection({ site }: { site: SiteData }) {
  const t = site.text;
  const { ref, visible } = useScrollReveal();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = site.checklist;
  const current = tabs[Math.min(activeTab, tabs.length - 1)];

  return (
    <section className="py-24 px-6" style={{ background: "#0b1a33" }}>
      <div ref={ref} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <Reveal from="left">
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.statsTag}</div>
            <h2 className="text-4xl font-extrabold leading-tight whitespace-pre-line" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {t.statsTitle}
            </h2>
          </Reveal>
          <div className="flex gap-10 flex-wrap">
            {site.impactStats.map((st, i) => (
              <ImpactStat key={i} stat={st} color={i % 2 === 0 ? "#00f2ff" : "#ffb703"} visible={visible} />
            ))}
          </div>
          <p className="text-sm leading-relaxed max-w-md" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
            {t.statsBody}
          </p>
        </div>
        <Reveal from="right">
          <div className="rounded-3xl p-7" style={{ background: "rgba(6,15,30,.65)", border: "1px solid rgba(0,242,255,.12)", backdropFilter: "blur(12px)" }}>
            <h3 className="text-sm font-bold mb-5" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.checklistTitle}</h3>
            <div className="flex gap-2 flex-wrap mb-5">
              {tabs.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(i)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: activeTab === i ? "#00f2ff" : "rgba(0,242,255,.06)", color: activeTab === i ? "#060f1e" : "rgba(226,232,240,.6)", border: "1px solid rgba(0,242,255,.18)", fontFamily: "'Inter',sans-serif" }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              {(current?.items ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} />
                  <span className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Services Grid ────────────────────────────────────────────────────────────
function ServicesGrid({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  const t = site.text;
  return (
    <section className="py-24 px-6" style={{ background: "#ffffff" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#0b1a33", fontFamily: "'JetBrains Mono',monospace" }}>{t.servicesTag}</div>
            <h2 className="text-4xl font-extrabold" style={{ color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.servicesTitle}</h2>
          </div>
          <button onClick={() => setPage("contacto")} className="flex items-center gap-2 font-semibold text-sm transition-colors hover:underline" style={{ color: "#1565c0", fontFamily: "'Inter',sans-serif" }}>
            {t.servicesLink} <ArrowRight size={16} />
          </button>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {site.serviceCards.map((s, i) => { const Icon = iconFor(s.icon); return (
            <Reveal key={i} delay={i * 80}>
              <TiltCard onClick={() => setPage(s.page)} className="group text-left p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer h-full anim-border-pulse"
                style={{ background: "#060f1e", border: "1px solid rgba(0,242,255,.08)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-200 group-hover:scale-110"
                  style={{ background: "rgba(0,242,255,.07)", border: "1px solid rgba(0,242,255,.14)" }}>
                  <Icon size={20} style={{ color: "#00f2ff" }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b", fontFamily: "'Inter',sans-serif" }}>{s.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold transition-colors group-hover:text-white" style={{ color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}>
                  {t.servicesCardLink} <ChevronRight size={14} />
                </div>
              </TiltCard>
            </Reveal>
          ); })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  const t = site.text;
  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #060f1e 0%, #0b1a33 50%, #060f1e 100%)" }}>
      <ParticleCanvas density={30} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,242,255,.05) 0%, transparent 65%)" }} />
      <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="text-xs font-bold tracking-[.2em] uppercase mb-4" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.ctaTag}</div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 whitespace-pre-line" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {t.ctaTitle}
        </h2>
        <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
          {t.ctaBody}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => setPage("contacto")} className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:brightness-110"
            style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {t.ctaButton}
          </button>
          <a href={telHref(t.phone1)} className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 flex items-center gap-2"
            style={{ border: "1px solid rgba(0,242,255,.35)", color: "#00f2ff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <Phone size={16} /> {t.phone1.replace(/-/g, " ")}
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  return (
    <>
      <HeroSection site={site} setPage={setPage} />
      <SectoresSection site={site} />
      <StatsSection site={site} />
      <ServicesGrid site={site} setPage={setPage} />
      <CTABanner site={site} setPage={setPage} />
    </>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
function PageHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <section className="pt-32 pb-16 px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #060f1e 0%, #0b1a33 100%)" }}>
      <ParticleCanvas density={25} />
      <div className="anim-scan" />
      <Reveal className="relative z-10 max-w-7xl mx-auto text-center">
        <div className="text-xs font-bold tracking-[.2em] uppercase mb-4" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{tag}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{subtitle}</p>
      </Reveal>
    </section>
  );
}

// ─── Instalación Page ─────────────────────────────────────────────────────────
function InstalacionPage({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  const t = site.text;
  return (
    <>
      <PageHeader tag={t.instTag} title={t.instTitle} subtitle={t.instSubtitle} />
      <section className="py-16 px-6" style={{ background: "#060f1e" }}>
        <div className="max-w-7xl mx-auto space-y-20">
          {site.installServices.map((svc, i) => { const Icon = iconFor(svc.icon); return (
            <Reveal key={i} from={i % 2 === 0 ? "left" : "right"}>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative rounded-2xl overflow-hidden bg-slate-800" style={{ aspectRatio: "16/10" }}>
                  <img src={mediaSrc(svc.imageUrl)} alt={svc.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,15,30,.75) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(0,242,255,.12)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{svc.tag}</span>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,242,255,.07)", border: "1px solid rgba(0,242,255,.14)" }}>
                    <Icon size={20} style={{ color: "#00f2ff" }} />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{svc.title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{svc.desc}</p>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.instBenefitsLabel}</p>
                    <ul className="space-y-2">{svc.objectives.map((o, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} />
                        <span className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{o}</span>
                      </li>
                    ))}</ul>
                  </div>
                </div>
              </div>
            </Reveal>
          ); })}
        </div>
      </section>
      <CTABanner site={site} setPage={setPage} />
    </>
  );
}

// ─── Mantenimiento Page ───────────────────────────────────────────────────────
const MANT_COLORS = ["#00f2ff", "#ffb703"];

function MantenimientoPage({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  const t = site.text;
  const [tab, setTab] = useState(0);
  const cats = site.mantCategories;
  const current = cats[Math.min(tab, cats.length - 1)];
  const CurrentIcon = iconFor(current?.icon ?? "");
  return (
    <>
      <PageHeader tag={t.mantTag} title={t.mantTitle} subtitle={t.mantSubtitle} />
      <section className="py-16 px-6" style={{ background: "#060f1e" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {site.mantCards.map((card, i) => { const c = { ...card, color: MANT_COLORS[i % 2], Icon: iconFor(card.icon) }; return (
              <Reveal key={i} from={i % 2 === 0 ? "left" : "right"}>
                <TiltCard className="relative rounded-3xl overflow-hidden" style={{ border: `1px solid ${c.color}22`, minHeight: 280 }}>
                  <div className="absolute inset-0 bg-slate-900">
                    {c.imageUrl && <img src={mediaSrc(c.imageUrl)} alt={c.headline} className="w-full h-full object-cover opacity-25" />}
                  </div>
                  <div className="relative z-10 p-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${c.color}18`, border: `1px solid ${c.color}33` }}>
                      <c.Icon size={22} style={{ color: c.color }} />
                    </div>
                    <div className="text-xs font-bold tracking-[.2em] mb-2" style={{ color: c.color, fontFamily: "'JetBrains Mono',monospace" }}>{c.type}</div>
                    <h2 className="text-2xl font-extrabold mb-3" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{c.headline}</h2>
                    <p className="text-sm mb-5" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{c.body}</p>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-black" style={{ color: c.color, fontFamily: "'JetBrains Mono',monospace" }}>{c.stat}</div>
                      <div className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{c.statLabel}</div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ); })}
          </div>

          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.mantProtocolTitle}</h2>
            <p className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{t.mantProtocolSubtitle}</p>
          </Reveal>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {cats.map((c, i) => { const Icon = iconFor(c.icon); return (
              <button key={i} onClick={() => setTab(i)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: tab === i ? "#00f2ff" : "rgba(0,242,255,.06)", color: tab === i ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${tab === i ? "#00f2ff" : "rgba(0,242,255,.15)"}`, fontFamily: "'Inter',sans-serif" }}>
                <Icon size={14} />{c.title}
              </button>
            ); })}
          </div>
          <Reveal>
            <div className="max-w-2xl mx-auto rounded-3xl p-8" style={{ background: "rgba(11,26,51,.65)", border: "1px solid rgba(0,242,255,.12)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-3 mb-6">
                <CurrentIcon size={22} style={{ color: "#00f2ff" }} />
                <h3 className="text-lg font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.mantProtocolPrefix} {current?.title}</h3>
              </div>
              <ul className="space-y-3">
                {(current?.items ?? []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid rgba(0,242,255,.05)" }}>
                    <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} />
                    <span className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
      <CTABanner site={site} setPage={setPage} />
    </>
  );
}

// ─── Galería Técnica (Portafolio Interactivo) ────────────────────────────────
const GALLERY_SIZE_CLASSES: Record<GalleryItem["size"], string> = {
  big: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  normal: "col-span-1 row-span-1",
};

function GalleryLightbox({ site, items, index, onClose, onNav }: { site: SiteData; items: GalleryItem[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  const item = items[index];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onNav]);

  if (!item) return null;
  const cat = site.galleryCategories.find(c => c.id === item.category);
  const CatIcon = iconFor(cat?.icon ?? "");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8" style={{ animation: "scaleIn .2s ease" }}>
      <div className="absolute inset-0" style={{ background: "rgba(2,6,15,.94)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <button onClick={onClose} aria-label="Cerrar" className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,.06)", color: "#e2e8f0" }}>
        <X size={20} />
      </button>
      <button onClick={() => onNav((index - 1 + items.length) % items.length)} aria-label="Anterior" className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,.06)", color: "#00f2ff" }}>
        <ChevronLeft size={22} />
      </button>
      <button onClick={() => onNav((index + 1) % items.length)} aria-label="Siguiente" className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,.06)", color: "#00f2ff" }}>
        <ChevronRight size={22} />
      </button>
      <div className="relative z-10 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,242,255,.18)", boxShadow: "0 30px 100px rgba(0,0,0,.7)" }}>
          <img src={mediaSrc(item.src)} alt={item.alt} className="w-full max-h-[70vh] object-contain" style={{ background: "#000" }} />
        </div>
        <div className="mt-4 flex items-center gap-3 justify-center text-center flex-wrap">
          {cat && <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase flex items-center gap-1.5" style={{ background: "rgba(0,242,255,.12)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
            <CatIcon size={11} />{cat.label}
          </span>}
          <span className="text-xs" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>{index + 1} / {items.length}</span>
        </div>
        <p className="mt-2 text-sm text-center max-w-xl mx-auto" style={{ color: "#e2e8f0", fontFamily: "'Inter',sans-serif" }}>{item.alt}</p>
      </div>
    </div>
  );
}

function VideoLightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8" style={{ animation: "scaleIn .2s ease" }}>
      <div className="absolute inset-0" style={{ background: "rgba(2,6,15,.94)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <button onClick={onClose} aria-label="Cerrar" className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,.06)", color: "#e2e8f0" }}>
        <X size={20} />
      </button>
      <div className="relative z-10 max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,242,255,.18)", boxShadow: "0 30px 100px rgba(0,0,0,.7)" }}>
          <video src={mediaSrc(src)} controls autoPlay playsInline className="w-full max-h-[70vh]" style={{ background: "#000" }} />
        </div>
        <p className="mt-4 text-sm text-center" style={{ color: "#e2e8f0", fontFamily: "'Inter',sans-serif" }}>{label}</p>
      </div>
    </div>
  );
}

function VideoCard({ src, label, desc }: { src: string; label: string; desc: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TiltCard onClick={() => setOpen(true)} className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ aspectRatio: "16/9", border: "1px solid rgba(0,242,255,.14)" }}>
        <video src={mediaSrc(src)} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-45 transition-opacity duration-300 group-hover:opacity-65" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,15,30,.92) 10%, rgba(6,15,30,.3) 60%, rgba(6,15,30,.5) 100%)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: "rgba(0,242,255,.16)", border: "1px solid rgba(0,242,255,.4)", backdropFilter: "blur(4px)" }}>
            <PlayCircle size={30} style={{ color: "#00f2ff" }} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: "rgba(0,242,255,.14)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>Video</span>
          <h4 className="text-sm font-bold mt-2" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{label}</h4>
          <p className="text-xs mt-0.5" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{desc}</p>
        </div>
      </TiltCard>
      {open && <VideoLightbox src={src} label={label} onClose={() => setOpen(false)} />}
    </>
  );
}

function GallerySection({ site }: { site: SiteData }) {
  const t = site.text;
  const [filter, setFilter] = useState("todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const items = site.galleryItems.filter(i => i.src);
  const filtered = filter === "todos" ? items : items.filter(i => i.category === filter);

  return (
    <section className="py-16 px-6" style={{ background: "#060f1e" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-10">
          <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.galleryTag}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.galleryTitle}</h2>
          <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{t.gallerySubtitle}</p>
        </Reveal>

        {/* Filter tabs */}
        <div className="flex gap-2 justify-center mb-10 flex-wrap">
          <button onClick={() => setFilter("todos")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{ background: filter === "todos" ? "#00f2ff" : "rgba(0,242,255,.07)", color: filter === "todos" ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${filter === "todos" ? "#00f2ff" : "rgba(0,242,255,.18)"}`, fontFamily: "'Inter',sans-serif" }}>
            {t.galleryAllLabel}
          </button>
          {site.galleryCategories.map(c => { const Icon = iconFor(c.icon); return (
            <button key={c.id} onClick={() => setFilter(c.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: filter === c.id ? "#00f2ff" : "rgba(0,242,255,.07)", color: filter === c.id ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${filter === c.id ? "#00f2ff" : "rgba(0,242,255,.18)"}`, fontFamily: "'Inter',sans-serif" }}>
              <Icon size={14} />{c.label}
            </button>
          ); })}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-flow-row-dense gap-3 sm:gap-4 auto-rows-[150px] sm:auto-rows-[180px] lg:auto-rows-[210px]">
          {filtered.map((item, i) => {
            const cat = site.galleryCategories.find(c => c.id === item.category);
            const CatIcon = iconFor(cat?.icon ?? "");
            return (
              <Reveal key={item.id} delay={(i % 8) * 45} className={GALLERY_SIZE_CLASSES[item.size]}>
                <TiltCard onClick={() => setLightboxIndex(i)} className="group relative w-full h-full rounded-2xl overflow-hidden cursor-pointer" style={{ border: "1px solid rgba(0,242,255,.1)" }}>
                  <img src={mediaSrc(item.src)} alt={item.alt} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(6,15,30,.95) 0%, rgba(6,15,30,.15) 55%, transparent 100%)" }} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,242,255,.18)", border: "1px solid rgba(0,242,255,.4)", backdropFilter: "blur(4px)" }}>
                      <Maximize2 size={16} style={{ color: "#00f2ff" }} />
                    </div>
                  </div>
                  {cat && <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase inline-flex items-center gap-1" style={{ background: "rgba(0,242,255,.16)", border: "1px solid rgba(0,242,255,.35)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
                      <CatIcon size={9} />{cat.label}
                    </span>
                  </div>}
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Videos complementarios */}
        <div className="mt-16">
          <Reveal className="text-center mb-8">
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-2" style={{ color: "#ffb703", fontFamily: "'JetBrains Mono',monospace" }}>{t.videosTag}</div>
            <h3 className="text-2xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.videosTitle}</h3>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {site.galleryVideos.filter(v => v.src).map(v => <VideoCard key={v.id} src={v.src} label={v.label} desc={v.desc} />)}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox site={site} items={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={setLightboxIndex} />
      )}
    </section>
  );
}

// ─── Proyectos Page ───────────────────────────────────────────────────────────
function ProyectosPage({ site, setPage }: { site: SiteData; setPage: (p: Page) => void }) {
  const t = site.text;
  const projects: Project[] = site.projects;
  const catLabel = (c: string) => t[`cat_${c}` as keyof SiteData["text"]] ?? c;
  const [filter, setFilter] = useState("todos");
  const filtered = filter === "todos" ? projects : projects.filter(p => p.category === filter);
  return (
    <>
      <PageHeader tag={t.projTag} title={t.projTitle} subtitle={t.projSubtitle} />
      <GallerySection site={site} />
      <section className="py-16 px-6" style={{ background: "#0b1a33" }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.portfolioTag}</div>
            <h2 className="text-3xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.portfolioTitle}</h2>
          </Reveal>
          <div className="flex gap-3 justify-center mb-12 flex-wrap">
            {["todos", "residencial", "comercial", "industrial"].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className="px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-all"
                style={{ background: filter === cat ? "#00f2ff" : "rgba(0,242,255,.07)", color: filter === cat ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${filter === cat ? "#00f2ff" : "rgba(0,242,255,.18)"}`, fontFamily: "'Inter',sans-serif" }}>
                {cat === "todos" ? t.galleryAllLabel : catLabel(cat)}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: "#334155" }}>
              <ImageIcon size={40} className="mx-auto mb-4" />
              <p style={{ fontFamily: "'Inter',sans-serif" }}>{t.portfolioEmpty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <TiltCard className="group relative rounded-2xl overflow-hidden bg-slate-800 cursor-default" style={{ aspectRatio: "4/3" }}>
                    {p.imageUrl && <img src={mediaSrc(p.imageUrl)} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,15,30,.96) 0%, rgba(6,15,30,.4) 55%, transparent 100%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: "rgba(0,242,255,.14)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
                        {catLabel(p.category)}
                      </span>
                      <h3 className="text-base font-bold mt-2 mb-1" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.title}</h3>
                      <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>{p.items}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      <CTABanner site={site} setPage={setPage} />
    </>
  );
}

// ─── Contacto Page ────────────────────────────────────────────────────────────
function ContactoPage({ site }: { site: SiteData }) {
  const t = site.text;
  return (
    <>
      <PageHeader tag={t.contactTag} title={t.contactTitle} subtitle={t.contactSubtitle} />
      <section className="py-16 px-6" style={{ background: "#060f1e" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-5">
            <Reveal>
              <h2 className="text-2xl font-extrabold mb-6" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.contactInfoTitle}</h2>
            </Reveal>
            {[
              { icon: Phone, label: t.contactLabelPhone1, value: `+57 ${t.phone1}`, href: telHref(t.phone1) },
              { icon: Phone, label: t.contactLabelPhone2, value: `+57 ${t.phone2}`, href: telHref(t.phone2) },
              { icon: Mail, label: t.contactLabelEmail, value: t.email, href: `mailto:${t.email}` },
              { icon: MapPin, label: t.contactLabelAddress, value: [t.address, t.country].filter(Boolean).join(", "), href: `https://www.google.com/maps/search/${encodeURIComponent([t.address, t.country].filter(Boolean).join(", "))}` },
            ].filter(item => item.value.replace("+57 ", "")).map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{ background: "rgba(11,26,51,.6)", border: "1px solid rgba(0,242,255,.1)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: "rgba(0,242,255,.08)" }}>
                    <item.icon size={17} style={{ color: "#00f2ff" }} />
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#475569", fontFamily: "'JetBrains Mono',monospace" }}>{item.label}</div>
                    <div className="text-sm font-semibold transition-colors group-hover:text-cyan-300" style={{ color: "#e2e8f0", fontFamily: "'Inter',sans-serif" }}>{item.value}</div>
                  </div>
                </a>
              </Reveal>
            ))}
            <Reveal delay={320}>
              <div className="p-5 rounded-2xl" style={{ background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.08)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.socialTag}</p>
                <div className="flex gap-3 flex-wrap">
                  {site.socials.map(s => ({ n: s.name, h: s.handle, href: s.href })).map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="flex-1 p-4 rounded-2xl text-center transition-all hover:-translate-y-0.5"
                      style={{ background: "rgba(0,242,255,.04)", border: "1px solid rgba(0,242,255,.1)" }}>
                      <div className="text-xs font-bold" style={{ color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}>{s.n}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>{s.h}</div>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal from="right" className="lg:col-span-3">
            <div className="rounded-3xl p-8" style={{ background: "rgba(11,26,51,.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,242,255,.14)", boxShadow: "0 8px 48px rgba(0,0,0,.4)" }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.contactFormTitle}</h3>
              <p className="text-sm mb-7" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
                {t.contactFormSubtitle}
              </p>
              <ContactForm site={site} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage, site, onAdminOpen }: { setPage: (p: Page) => void; site: SiteData; onAdminOpen: () => void }) {
  const t = site.text;
  const content = t;
  return (
    <footer style={{ background: "#010409" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <button onClick={() => { setPage("home"); window.scrollTo({ top: 0 }); }} className="flex items-center gap-3 mb-4">
              <img src={mediaSrc(site.media.logoFooter)} alt={t.brandName} className="h-[180px] w-auto brightness-0 invert" />
            </button>
            <p className="text-sm leading-relaxed text-slate-300" style={{ fontFamily: "'Inter',sans-serif" }}>
              {t.footerDescription}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold mb-5 tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.footerNavTag}</p>
            <ul className="space-y-3">
              {navItems(t).map(item => (
                <li key={item.page}>
                  <button onClick={() => { setPage(item.page); window.scrollTo({ top: 0 }); }} className="text-sm text-slate-300 transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold mb-5 tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.footerServicesTag}</p>
            <ul className="space-y-3">
              {site.footerServices.map((s, i) => (
                <li key={i}><button onClick={() => { setPage(s.page); window.scrollTo({ top: 0 }); }} className="text-sm text-slate-300 transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>{s.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold mb-5 tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{t.footerContactTag}</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} /><span className="text-sm text-slate-300" style={{ fontFamily: "'Inter',sans-serif" }}>{content.address}</span></li>
              <li className="flex items-center gap-2"><Phone size={13} style={{ color: "#00f2ff" }} /><a href={telHref(content.phone1)} className="text-sm text-slate-300 inline-flex transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>+57 {content.phone1}</a></li>
              <li className="flex items-center gap-2"><Phone size={13} style={{ color: "#00f2ff" }} /><a href={telHref(content.phone2)} className="text-sm text-slate-300 inline-flex transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>+57 {content.phone2}</a></li>
              <li className="flex items-center gap-2"><Mail size={13} style={{ color: "#00f2ff" }} /><a href={`mailto:${content.email}`} className="text-sm text-slate-300 inline-flex transition-all duration-300 hover:text-white hover:-translate-y-0.5 break-all" style={{ fontFamily: "'Inter',sans-serif" }}>{content.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter',sans-serif" }}>
            {t.footerCopyright}
          </p>
          <div className="flex items-center gap-5">
            <button onClick={onAdminOpen} className="text-xs transition-colors hover:text-slate-300 flex items-center gap-1.5" style={{ color: "#cbd5e1", fontFamily: "'JetBrains Mono',monospace" }}>
              <User size={11} className="w-4 h-4 inline mr-1 text-cyan-400" /> Acceso Sistema
            </button>
            <a href="https://www.codecstudio.online/" target="_blank" rel="noopener noreferrer" className="text-xs hover:text-slate-300 transition-colors" style={{ color: "#cbd5e1", fontFamily: "'Inter',sans-serif" }}>
              DEVELOPED BY <span className="text-yellow-500 font-bold">CODEC STUDIO</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [site, setSite] = useSite();
  const [activePage, setActivePage] = useState<Page>("home");
  const [adminOpen, setAdminOpen] = useState(false);

  const setPage = (p: Page) => { setActivePage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.fontFamily = "'Inter', sans-serif";
  }, []);

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{CSS_ANIMS}</style>

      <div className="min-h-screen" style={{ background: "#060f1e" }}>
        <Navbar activePage={activePage} setPage={setPage} site={site} />

        <main>
          {activePage === "home" && <HomePage site={site} setPage={setPage} />}
          {activePage === "instalacion" && <InstalacionPage site={site} setPage={setPage} />}
          {activePage === "mantenimiento" && <MantenimientoPage site={site} setPage={setPage} />}
          {activePage === "proyectos" && <ProyectosPage site={site} setPage={setPage} />}
          {activePage === "contacto" && <ContactoPage site={site} />}
        </main>

        <Footer setPage={setPage} site={site} onAdminOpen={() => setAdminOpen(true)} />
        <WhatsAppFloat site={site} />
      </div>

      {adminOpen && (
        <AdminModal site={site} onPublished={setSite} onClose={() => setAdminOpen(false)} logo={<ShieldLogo size={52} />} />
      )}
    </>
  );
}
