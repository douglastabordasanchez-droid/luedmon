import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, Shield, Zap, Bell, Lock, Wrench, CheckCircle,
  Phone, Mail, MapPin, Menu, X, ArrowRight,
  Building2, ShoppingBag, Factory, Home as HomeIcon,
  ChevronRight, Settings, Eye, Users, User, Radio,
  Plus, Trash2, Edit3, Save, LogOut, BarChart3,
  Key, FileText, Image as ImageIcon,
  HardHat, Server, MonitorPlay, DoorClosed, MapPinned,
  PlayCircle, ChevronLeft, Maximize2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "instalacion" | "mantenimiento" | "proyectos" | "contacto";
type AdminTab = "panel" | "leads" | "proyectos" | "contenido" | "settings";

interface Lead {
  id: string; fecha: string; nombre: string; empresa: string;
  correo: string; telefono: string; servicio: string; mensaje: string;
  estado: "nuevo" | "en_proceso" | "cotizado";
}

interface Project {
  id: string; title: string;
  category: "residencial" | "comercial" | "industrial";
  items: string; imageUrl: string;
}

interface SiteContent {
  tagline: string; phone1: string; phone2: string;
  email: string; address: string;
  heroHeadline: string; heroSubHeadline: string; heroBody: string;
  slide2Headline: string; slide3Headline: string; slide3Body: string;
}

interface AppState {
  content: SiteContent;
  projects: Project[];
  leads: Lead[];
  adminPassword: string;
  adminFirstLogin: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_CONTENT: SiteContent = {
  tagline: "Instalación y Tecnologías en Seguridad",
  phone1: "315-800-6089",
  phone2: "311-218-1356",
  email: "luedmonsatelital@gmail.com",
  address: "Carrera 80D No. 8C - 31, Piso 3",
  heroHeadline: "Protección Inteligente",
  heroSubHeadline: "para lo que más importa",
  heroBody: "Instalamos sistemas de videovigilancia CCTV, biometría, talanqueras, control de acceso y alarmas para residencias, empresas y comunidades en Colombia.",
  slide2Headline: "Sistemas y Montajes de Alta Ingeniería",
  slide3Headline: "Garantía de Continuidad Operativa 24/7",
  slide3Body: "Evita fallas críticas duplicando la vida útil de tus equipos con revisiones técnicas semestrales certificadas.",
};

const DEFAULT_PROJECTS: Project[] = [
  { id: "1", title: "Conjunto Residencial El Pinar", category: "residencial", items: "CCTV · Control de Acceso · Alarma", imageUrl: "/imagen 1.png" },
  { id: "2", title: "Edificio Empresarial Centro Mayor", category: "comercial", items: "CCTV · Cerca Eléctrica · Alarma", imageUrl: "/imagen 10.png" },
  { id: "3", title: "Planta Industrial Zona Franca", category: "industrial", items: "CCTV HD · Control de Acceso · Cerca Eléctrica", imageUrl: "/imagen 7.png" },
  { id: "4", title: "Urbanización Villa del Sol", category: "residencial", items: "CCTV · Alarma Comunitaria · Videoportero", imageUrl: "/imagen 3.png" },
  { id: "5", title: "Centro Comercial Multiplaza", category: "comercial", items: "CCTV · Control Vehicular · Alarmas", imageUrl: "/imagen 17.png" },
  { id: "6", title: "Bodega Logística Norte", category: "industrial", items: "CCTV Exterior · Cerca Eléctrica · Control de Acceso", imageUrl: "/imagen 14.png" },
];

const DEFAULT_APP_STATE: AppState = {
  content: DEFAULT_CONTENT,
  projects: DEFAULT_PROJECTS,
  leads: [],
  adminPassword: "Luedmon2026++",
  adminFirstLogin: true,
};

// ─── Persist Hook ──────────────────────────────────────────────────────────────
function usePersistedState() {
  const [state, setStateRaw] = useState<AppState>(() => {
    try {
      const s = localStorage.getItem("luedmon_v2");
      if (!s) return DEFAULT_APP_STATE;
      const parsed = JSON.parse(s) as Partial<AppState>;
      return {
        ...DEFAULT_APP_STATE,
        ...parsed,
        content: { ...DEFAULT_CONTENT, ...(parsed.content ?? {}) },
        projects: parsed.projects ?? DEFAULT_PROJECTS,
        leads: parsed.leads ?? [],
      };
    } catch {
      return DEFAULT_APP_STATE;
    }
  });

  const setState = useCallback((updater: (prev: AppState) => AppState) => {
    setStateRaw(prev => {
      const next = updater(prev);
      try { localStorage.setItem("luedmon_v2", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [state, setState] as const;
}

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
      const cur = phrases[s.current.p];
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
          s.current.p = (s.current.p + 1) % phrases.length;
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

// ─── Admin – Login ────────────────────────────────────────────────────────────
function AdminLogin({ pw, onSuccess, onClose }: { pw: string; onSuccess: () => void; onClose: () => void }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (u === "luedmon" && p === pw) { onSuccess(); } else { setErr("Credenciales incorrectas."); }
  };
  const inp = "w-full px-4 py-3 rounded-xl outline-none text-sm";
  const iStyle = { background: "rgba(0,242,255,.05)", border: "1px solid rgba(0,242,255,.2)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };
  return (
    <div className="flex items-center justify-center h-full p-8">
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><ShieldLogo size={52} /></div>
          <h2 className="text-2xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Acceso Sistema</h2>
          <p className="text-sm mt-1" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>Panel de Administración LUEDMON</p>
        </div>
        {err && <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5", fontFamily: "'Inter',sans-serif" }}>{err}</div>}
        <input className={inp} style={iStyle} placeholder="Usuario" value={u} onChange={e => setU(e.target.value)} required autoComplete="username" />
        <input type="password" className={inp} style={iStyle} placeholder="Contraseña" value={p} onChange={e => setP(e.target.value)} required autoComplete="current-password" />
        <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110" style={{ background: "#00f2ff", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Ingresar →
        </button>
        <button type="button" onClick={onClose} className="w-full text-sm py-2 transition-colors hover:text-slate-300" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>Cancelar</button>
      </form>
    </div>
  );
}

// ─── Admin – Change Password ──────────────────────────────────────────────────
function AdminChangePw({ onSave }: { onSave: (pw: string) => void }) {
  const [p1, setP1] = useState(""); const [p2, setP2] = useState(""); const [err, setErr] = useState("");
  const inp = "w-full px-4 py-3 rounded-xl outline-none text-sm";
  const iStyle = { background: "rgba(0,242,255,.05)", border: "1px solid rgba(0,242,255,.2)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.length < 8) return setErr("Mínimo 8 caracteres.");
    if (p1 !== p2) return setErr("Las contraseñas no coinciden.");
    onSave(p1);
  };
  return (
    <div className="flex items-center justify-center h-full p-8">
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,183,3,.1)", border: "1px solid rgba(255,183,3,.3)" }}>
            <Key size={26} style={{ color: "#ffb703" }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Cambiar Contraseña</h2>
          <p className="text-sm mt-1" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>Por seguridad, establezca una contraseña propia.</p>
        </div>
        {err && <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>{err}</div>}
        <input type="password" className={inp} style={iStyle} placeholder="Nueva contraseña" value={p1} onChange={e => setP1(e.target.value)} required />
        <input type="password" className={inp} style={iStyle} placeholder="Confirmar contraseña" value={p2} onChange={e => setP2(e.target.value)} required />
        <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Guardar contraseña →
        </button>
      </form>
    </div>
  );
}

// ─── Admin – Dashboard ────────────────────────────────────────────────────────
function AdminDashboard({
  appState, setAppState, onClose,
}: {
  appState: AppState;
  setAppState: (fn: (p: AppState) => AppState) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("panel");
  const { content, projects, leads, adminPassword } = appState;

  // ── Panel Tab ──
  const PanelTab = () => {
    const stats = [
      { label: "Total Leads", value: leads.length, icon: FileText, color: "#00f2ff" },
      { label: "Leads Nuevos", value: leads.filter(l => l.estado === "nuevo").length, icon: Bell, color: "#ffb703" },
      { label: "Proyectos", value: projects.length, icon: ImageIcon, color: "#10b981" },
      { label: "En Proceso", value: leads.filter(l => l.estado === "en_proceso").length, icon: Settings, color: "#8b5cf6" },
    ];
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Panel de Control</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: "rgba(11,26,51,.7)", border: "1px solid rgba(0,242,255,.1)" }}>
              <s.icon size={20} style={{ color: s.color, marginBottom: 10 }} />
              <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "#64748b", fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {leads.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>// ÚLTIMOS LEADS</h3>
            <div className="space-y-2">
              {leads.slice(-5).reverse().map(l => (
                <div key={l.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.07)" }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#e2e8f0", fontFamily: "'Inter',sans-serif" }}>{l.nombre}</div>
                    <div className="text-xs" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>{l.servicio} · {l.fecha}</div>
                  </div>
                  <LeadBadge estado={l.estado} />
                </div>
              ))}
            </div>
          </div>
        )}
        {leads.length === 0 && (
          <div className="text-center py-12" style={{ color: "#334155" }}>
            <BarChart3 size={32} className="mx-auto mb-3" />
            <p className="text-sm" style={{ fontFamily: "'Inter',sans-serif" }}>No hay leads todavía. Los formularios enviados aparecerán aquí.</p>
          </div>
        )}
      </div>
    );
  };

  // ── Leads Tab ──
  const LeadBadge = ({ estado }: { estado: Lead["estado"] }) => {
    const cfg = {
      nuevo: { bg: "rgba(0,242,255,.1)", color: "#00f2ff", label: "Nuevo" },
      en_proceso: { bg: "rgba(255,183,3,.1)", color: "#ffb703", label: "En Proceso" },
      cotizado: { bg: "rgba(16,185,129,.1)", color: "#10b981", label: "Cotizado" },
    }[estado];
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color, fontFamily: "'JetBrains Mono',monospace" }}>{cfg.label}</span>;
  };

  const LeadsTab = () => {
    const cycleEstado = (id: string) => {
      setAppState(prev => ({
        ...prev, leads: prev.leads.map(l => l.id === id ? {
          ...l,
          estado: l.estado === "nuevo" ? "en_proceso" : l.estado === "en_proceso" ? "cotizado" : "nuevo"
        } : l)
      }));
    };
    const deleteLead = (id: string) => setAppState(prev => ({ ...prev, leads: prev.leads.filter(l => l.id !== id) }));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Leads y Cotizaciones</h2>
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(0,242,255,.08)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{leads.length} registros</span>
        </div>
        {leads.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#334155" }}>
            <FileText size={36} className="mx-auto mb-3" />
            <p className="text-sm" style={{ fontFamily: "'Inter',sans-serif" }}>Aún no hay cotizaciones. Cuando alguien llene el formulario aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map(l => (
              <div key={l.id} className="p-5 rounded-2xl" style={{ background: "rgba(11,26,51,.6)", border: "1px solid rgba(0,242,255,.09)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{l.nombre}</span>
                      {l.empresa && <span className="text-xs" style={{ color: "#475569" }}>· {l.empresa}</span>}
                      <LeadBadge estado={l.estado} />
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <a href={`tel:${l.telefono}`} className="text-xs flex items-center gap-1 hover:text-cyan-300 transition-colors" style={{ color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}><Phone size={12} />{l.telefono}</a>
                      <a href={`mailto:${l.correo}`} className="text-xs flex items-center gap-1 hover:text-cyan-300 transition-colors" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}><Mail size={12} />{l.correo}</a>
                    </div>
                    <div className="text-xs" style={{ color: "#334155", fontFamily: "'Inter',sans-serif" }}>{l.servicio} · {l.fecha}</div>
                    {l.mensaje && <p className="text-xs mt-1" style={{ color: "#64748b", fontFamily: "'Inter',sans-serif" }}>{l.mensaje}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => cycleEstado(l.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110" style={{ background: "rgba(0,242,255,.1)", color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}>
                      Cambiar estado
                    </button>
                    <button onClick={() => deleteLead(l.id)} className="px-3 py-1.5 rounded-lg transition-all hover:brightness-110" style={{ background: "rgba(239,68,68,.1)", color: "#fca5a5" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Projects Tab ──
  const ProyectosTab = () => {
    const [editing, setEditing] = useState<Project | null>(null);
    const [adding, setAdding] = useState(false);
    const blank: Project = { id: "", title: "", category: "residencial", items: "", imageUrl: "" };
    const [form, setForm] = useState<Project>(blank);
    const inp = "w-full px-3 py-2.5 rounded-xl outline-none text-sm";
    const iS = { background: "rgba(0,242,255,.04)", border: "1px solid rgba(0,242,255,.18)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };

    const saveProject = () => {
      if (!form.title || !form.items) return;
      setAppState(prev => {
        const id = editing ? editing.id : Date.now().toString();
        const updated = editing
          ? prev.projects.map(p => p.id === id ? { ...form, id } : p)
          : [...prev.projects, { ...form, id }];
        return { ...prev, projects: updated };
      });
      setEditing(null); setAdding(false); setForm(blank);
    };

    const deleteProject = (id: string) => setAppState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));

    const startEdit = (p: Project) => { setEditing(p); setAdding(false); setForm({ ...p }); };
    const startAdd = () => { setEditing(null); setAdding(true); setForm(blank); };

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Gestionar Proyectos</h2>
          <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ background: "#00f2ff", color: "#060f1e", fontFamily: "'Inter',sans-serif" }}>
            <Plus size={16} /> Nuevo Proyecto
          </button>
        </div>

        {(adding || editing) && (
          <div className="p-6 rounded-2xl space-y-3" style={{ background: "rgba(0,11,28,.8)", border: "1px solid rgba(0,242,255,.2)" }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
              {editing ? "// EDITAR PROYECTO" : "// NUEVO PROYECTO"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className={inp} style={iS} placeholder="Título del proyecto" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <select className={inp} style={{ ...iS, cursor: "pointer" }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Project["category"] }))}>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
              </select>
              <input className={inp} style={iS} placeholder="Sistemas instalados (ej: CCTV · Alarma)" value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} />
              <input className={inp} style={iS} placeholder="URL de imagen (Unsplash o similar)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={saveProject} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110" style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Inter',sans-serif" }}>
                <Save size={15} /> Guardar
              </button>
              <button onClick={() => { setEditing(null); setAdding(false); }} className="px-4 py-2.5 rounded-xl text-sm transition-all hover:brightness-110" style={{ background: "rgba(255,255,255,.05)", color: "#94a3b8" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="rounded-2xl overflow-hidden relative group" style={{ border: "1px solid rgba(0,242,255,.09)" }}>
              <div className="bg-slate-800" style={{ height: 140 }}>
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover opacity-60" />}
              </div>
              <div className="p-4" style={{ background: "rgba(11,26,51,.8)" }}>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: "rgba(0,242,255,.1)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{p.category}</span>
                <p className="text-sm font-bold mt-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.title}</p>
                <p className="text-xs mt-1" style={{ color: "#475569", fontFamily: "'JetBrains Mono',monospace" }}>{p.items}</p>
              </div>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,242,255,.15)", color: "#00f2ff" }}><Edit3 size={14} /></button>
                <button onClick={() => deleteProject(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,.15)", color: "#fca5a5" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Contenido Tab ──
  const ContenidoTab = () => {
    const [local, setLocal] = useState({ ...content });
    const [saved, setSaved] = useState(false);
    const inp = "w-full px-3 py-2.5 rounded-xl outline-none text-sm";
    const iS = { background: "rgba(0,242,255,.04)", border: "1px solid rgba(0,242,255,.18)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };
    const save = () => {
      setAppState(prev => ({ ...prev, content: local }));
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    };
    const Field = ({ label, field }: { label: string; field: keyof SiteContent }) => (
      <div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{label}</label>
        <input className={inp} style={iS} value={local[field]} onChange={e => setLocal(l => ({ ...l, [field]: e.target.value }))} />
      </div>
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Gestionar Contenido</h2>
          <button onClick={save} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110" style={{ background: saved ? "#10b981" : "#ffb703", color: "#060f1e", fontFamily: "'Inter',sans-serif" }}>
            <Save size={15} /> {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>
          Los cambios se reflejan en tiempo real en el sitio web.
        </p>

        {/* Marca */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.08)" }}>
          <p className="text-xs font-bold tracking-widest" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>// MARCA</p>
          <Field label="Tagline / Eslogan" field="tagline" />
        </div>

        {/* Contacto */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.08)" }}>
          <p className="text-xs font-bold tracking-widest" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>// DATOS DE CONTACTO</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Teléfono Principal" field="phone1" />
            <Field label="Teléfono Alterno" field="phone2" />
            <Field label="Correo Electrónico" field="email" />
            <Field label="Dirección" field="address" />
          </div>
        </div>

        {/* Hero */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.08)" }}>
          <p className="text-xs font-bold tracking-widest" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>// HERO - SLIDE 1</p>
          <Field label="Título principal" field="heroHeadline" />
          <Field label="Subtítulo" field="heroSubHeadline" />
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>Descripción</label>
            <textarea className={inp} style={iS} rows={3} value={local.heroBody} onChange={e => setLocal(l => ({ ...l, heroBody: e.target.value }))} />
          </div>
        </div>

        {/* Slides 2-3 */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.08)" }}>
          <p className="text-xs font-bold tracking-widest" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>// HERO - SLIDES 2 Y 3</p>
          <Field label="Slide 2 – Título" field="slide2Headline" />
          <Field label="Slide 3 – Título" field="slide3Headline" />
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>Slide 3 – Descripción</label>
            <textarea className={inp} style={iS} rows={3} value={local.slide3Body} onChange={e => setLocal(l => ({ ...l, slide3Body: e.target.value }))} />
          </div>
        </div>
      </div>
    );
  };

  // ── Settings Tab ──
  const SettingsTab = () => {
    const [p1, setP1] = useState(""); const [p2, setP2] = useState(""); const [msg, setMsg] = useState("");
    const save = (e: React.FormEvent) => {
      e.preventDefault();
      if (p1.length < 8) return setMsg("Mínimo 8 caracteres.");
      if (p1 !== p2) return setMsg("Las contraseñas no coinciden.");
      setAppState(prev => ({ ...prev, adminPassword: p1 }));
      setMsg("✓ Contraseña actualizada correctamente."); setP1(""); setP2("");
    };
    const inp = "w-full px-4 py-3 rounded-xl outline-none text-sm";
    const iS = { background: "rgba(0,242,255,.05)", border: "1px solid rgba(0,242,255,.2)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };
    return (
      <div className="max-w-sm space-y-5">
        <h2 className="text-xl font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Configuración</h2>
        <form onSubmit={save} className="space-y-4">
          <p className="text-xs font-bold" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace" }}>// CAMBIAR CONTRASEÑA</p>
          {msg && <div className="p-3 rounded-xl text-sm" style={{ background: msg.startsWith("✓") ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)", border: msg.startsWith("✓") ? "1px solid rgba(16,185,129,.3)" : "1px solid rgba(239,68,68,.3)", color: msg.startsWith("✓") ? "#6ee7b7" : "#fca5a5", fontFamily: "'Inter',sans-serif" }}>{msg}</div>}
          <input type="password" className={inp} style={iS} placeholder="Nueva contraseña" value={p1} onChange={e => setP1(e.target.value)} required />
          <input type="password" className={inp} style={iS} placeholder="Confirmar contraseña" value={p2} onChange={e => setP2(e.target.value)} required />
          <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Actualizar contraseña →
          </button>
        </form>
      </div>
    );
  };

  const TABS: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { id: "panel", label: "Panel", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: FileText },
    { id: "proyectos", label: "Proyectos", icon: ImageIcon },
    { id: "contenido", label: "Contenido", icon: Edit3 },
    { id: "settings", label: "Configuración", icon: Key },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col" style={{ background: "rgba(4,12,24,.95)", borderRight: "1px solid rgba(0,242,255,.1)" }}>
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(0,242,255,.08)" }}>
          <ShieldLogo size={28} />
          <div>
            <div className="text-xs font-bold tracking-widest" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>LUEDMON</div>
            <div className="text-[9px] tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>ADMIN</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: tab === t.id ? "rgba(0,242,255,.1)" : "transparent",
                color: tab === t.id ? "#00f2ff" : "#475569",
                fontFamily: "'Inter',sans-serif",
              }}>
              <t.icon size={16} />
              {t.label}
              {t.id === "leads" && leads.filter(l => l.estado === "nuevo").length > 0 && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,183,3,.2)", color: "#ffb703", fontFamily: "'JetBrains Mono',monospace" }}>
                  {leads.filter(l => l.estado === "nuevo").length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:text-red-400" style={{ color: "#334155", fontFamily: "'Inter',sans-serif" }}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8" style={{ background: "rgba(6,15,30,.95)" }}>
        {tab === "panel" && <PanelTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "proyectos" && <ProyectosTab />}
        {tab === "contenido" && <ContenidoTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// ─── Admin Modal Orchestrator ─────────────────────────────────────────────────
function AdminModal({ appState, setAppState, onClose }: {
  appState: AppState; setAppState: (fn: (p: AppState) => AppState) => void; onClose: () => void;
}) {
  const [phase, setPhase] = useState<"login" | "changepw" | "dashboard">("login");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    if (appState.adminFirstLogin) { setPhase("changepw"); } else { setPhase("dashboard"); }
    setLoggedIn(true);
  };

  const handlePwSave = (pw: string) => {
    setAppState(prev => ({ ...prev, adminPassword: pw, adminFirstLogin: false }));
    setPhase("dashboard");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch" style={{ animation: "scaleIn .25s ease" }}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)" }} onClick={phase === "login" ? onClose : undefined} />
      {/* Panel */}
      <div className="relative z-10 m-auto w-full flex flex-col" style={{
        maxWidth: phase === "dashboard" ? "1100px" : "480px",
        height: phase === "dashboard" ? "85vh" : "auto",
        background: "#060f1e",
        border: "1px solid rgba(0,242,255,.18)",
        borderRadius: "1.5rem",
        overflow: "hidden",
        boxShadow: "0 30px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(0,242,255,.05)",
      }}>
        {/* Close btn (top-right) */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,.05)", color: "#64748b" }}>
          <X size={18} />
        </button>

        {!loggedIn && (
          <AdminLogin pw={appState.adminPassword} onSuccess={handleLoginSuccess} onClose={onClose} />
        )}
        {loggedIn && phase === "changepw" && <AdminChangePw onSave={handlePwSave} />}
        {loggedIn && phase === "dashboard" && (
          <AdminDashboard appState={appState} setAppState={setAppState} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: "Principal", page: "home" },
  { label: "Instalación", page: "instalacion" },
  { label: "Mantenimiento", page: "mantenimiento" },
  { label: "Proyectos", page: "proyectos" },
  { label: "Sede Central", page: "contacto" },
];

function Navbar({ activePage, setPage, tagline }: { activePage: Page; setPage: (p: Page) => void; tagline: string }) {
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
          <img src="/logo.png" alt="LUEDMON" className="h-12 w-auto brightness-0 invert" />
          <div>
            <div className="text-white font-bold uppercase text-lg" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>LUEDMON</div>
            <div className="text-xs text-slate-300" style={{ fontFamily: "'Inter',sans-serif" }}>Seguridad satelital</div>
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
          <a href="tel:+573158006089" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}>
            <Phone size={13} /> 315 800 6089
          </a>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded" style={{ background: "rgba(0,242,255,.08)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace", border: "1px solid rgba(0,242,255,.15)" }}>
            ● EN LÍNEA
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
          <a href="tel:+573158006089" className="flex items-center gap-2 py-3 px-4 text-sm font-semibold" style={{ color: "#00f2ff" }}>
            <Phone size={13} /> +57 315 800 6089
          </a>
        </div>
      )}
    </header>
  );
}

// ─── WhatsApp Float ───────────────────────────────────────────────────────────
function WhatsAppFloat() {
  const [hov, setHov] = useState(false);
  return (
    <div className="fixed bottom-7 right-7 z-50 flex items-center">
      {hov && (
        <div className="mr-3 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: "rgba(6,15,30,.95)", border: "1px solid rgba(0,242,255,.2)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif", backdropFilter: "blur(12px)", animation: "fadeLeft .2s ease" }}>
          Solicita tu cotización con LUEDMON
        </div>
      )}
      <a href="https://wa.me/573158006089?text=Hola%20LUEDMON%2C%20quiero%20solicitar%20una%20cotizaci%C3%B3n%20para%20mi%20proyecto." target="_blank" rel="noopener noreferrer"
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
const SVCS = ["Sistemas CCTV", "Control de Acceso / Biometría", "Alarmas Residenciales", "Alarmas Comunitarias", "Talanqueras / Puertas Automatizadas", "Cerca Eléctrica", "Videoportero", "Mantenimiento Preventivo", "Mantenimiento Correctivo"];

function ContactForm({ compact = false, onLead }: { compact?: boolean; onLead?: (l: Lead) => void }) {
  const [f, setF] = useState({ nombre: "", empresa: "", correo: "", telefono: "", servicio: "", mensaje: "" });
  const [sent, setSent] = useState(false);
  const inp = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all";
  const iS = { background: "rgba(0,242,255,.05)", border: "1px solid rgba(0,242,255,.18)", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }),
      ...f,
      estado: "nuevo",
    };
    onLead?.(lead);
    setSent(true);
    setF({ nombre: "", empresa: "", correo: "", telefono: "", servicio: "", mensaje: "" });
    setTimeout(() => setSent(false), 5000);
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
        <option value="" className="text-slate-200">Servicio de interés ▾</option>
        {SVCS.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
      </select>
      <textarea className={inp} style={iS} rows={compact ? 3 : 4} placeholder="Cuéntanos tu proyecto..." value={f.mensaje} onChange={e => setF({ ...f, mensaje: e.target.value })} />
      <button type="submit" className="w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] hover:brightness-110"
        style={{ background: sent ? "#10b981" : "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {sent ? "✓ ¡Solicitud enviada! Le contactamos pronto." : "Solicitar Cotización Gratuita →"}
      </button>
    </form>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ content, onLead }: { content: SiteContent; onLead: (l: Lead) => void }) {
  const [active, setActive] = useState(0);
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const headline = useTypewriter([content.heroHeadline, content.slide2Headline.split(" ").slice(0, 3).join(" "), "Vigilancia Avanzada"], 90);

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
            <video src="/camaras.mp4" autoPlay loop muted playsInline aria-hidden="true" className="object-cover absolute inset-0 w-full h-full -z-10" style={{ opacity: 0.1 }} />
            {/* Corner brackets */}
            {[["top-0 left-0 border-l border-t", "rounded-tl-lg"], ["top-0 right-0 border-r border-t", "rounded-tr-lg"], ["bottom-0 left-0 border-l border-b", "rounded-bl-lg"], ["bottom-0 right-0 border-r border-b", "rounded-br-lg"]].map(([pos, r], i) => (
              <span key={i} className={`absolute w-6 h-6 ${pos} ${r}`} style={{ borderColor: "rgba(0,242,255,.4)" }} />
            ))}

            <div className="relative z-10 p-10 md:p-14 flex flex-col justify-center min-h-[500px]">
              {active === 0 && (
                <div className="space-y-5" style={{ animation: "fadeUp .5s ease" }}>
                  <div className="flex items-center gap-3 mb-6">
                    <img src="/logo.png" alt="LUEDMON" className="h-16 w-auto brightness-0 invert" />
                    <div>
                      <div className="text-3xl font-black tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>LUEDMON</div>
                      <div className="text-xs text-slate-200" style={{ fontFamily: "'Inter',sans-serif" }}>Seguridad satelital</div>
                    </div>
                  </div>
                  <div className="text-5xl md:text-6xl font-black leading-none" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    <span className="anim-shimmer-text">{headline || "Protección"}</span>
                    <span className="cursor-blink ml-1" style={{ color: "#00f2ff" }}>|</span>
                  </div>
                  <div className="text-xl font-semibold text-slate-100" style={{ fontFamily: "'Inter',sans-serif" }}>{content.heroSubHeadline}</div>
                  <p className="text-sm leading-relaxed max-w-md text-slate-100 font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>{content.heroBody}</p>
                  <div className="flex gap-3 flex-wrap pt-2">
                    <a href="tel:+573158006089" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:brightness-110"
                      style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      <Phone size={15} /> Llamar ahora
                    </a>
                    <button className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                      style={{ border: "1px solid rgba(0,242,255,.35)", color: "#00f2ff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                      onClick={() => document.getElementById("contacto-form")?.scrollIntoView({ behavior: "smooth" })}>
                      Cotizar gratis
                    </button>
                  </div>
                </div>
              )}

              {active === 1 && (
                <div className="space-y-6" style={{ animation: "fadeUp .5s ease" }}>
                  <div className="text-xs font-bold tracking-[.2em] uppercase" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// INSTALACIÓN INTEGRADA</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{content.slide2Headline}</h2>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[{ icon: Camera, label: "Cámaras CCTV" }, { icon: Lock, label: "Biometría y Acceso" }, { icon: Bell, label: "Alarmas Inteligentes" }, { icon: Zap, label: "Cerca Eléctrica" }].map(c => (
                      <TiltCard key={c.label} className="flex items-center gap-3 p-4 rounded-2xl anim-border-pulse"
                        style={{ background: "rgba(0,242,255,.04)", border: "1px solid rgba(0,242,255,.12)" }}>
                        <c.icon size={20} style={{ color: "#00f2ff" }} />
                        <span className="text-sm font-medium text-slate-100" style={{ fontFamily: "'Inter',sans-serif" }}>{c.label}</span>
                      </TiltCard>
                    ))}
                  </div>
                  <button className="px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all"
                    style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    Ver todos los servicios →
                  </button>
                </div>
              )}

              {active === 2 && (
                <div className="space-y-5" style={{ animation: "fadeUp .5s ease" }}>
                  <div className="text-xs font-bold tracking-[.2em] uppercase" style={{ color: "#ffb703", fontFamily: "'JetBrains Mono',monospace" }}>// MANTENIMIENTO 24/7</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {content.slide3Headline.split(" ").slice(0, 3).join(" ")}<br />
                    <span style={{ color: "#ffb703" }}>{content.slide3Headline.split(" ").slice(3).join(" ")}</span>
                  </h2>
                  <p className="text-sm leading-relaxed max-w-md text-slate-100 font-medium" style={{ fontFamily: "'Inter',sans-serif" }}>{content.slide3Body}</p>
                  <div className="flex gap-8">
                    {[{ v: "-45%", l: "Costos emergencia" }, { v: "2X", l: "Vida útil equipos" }, { v: "24/7", l: "Soporte activo" }].map(s => (
                      <div key={s.v}>
                        <div className="text-3xl font-bold" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
                        <div className="text-xs mt-1" style={{ color: "rgba(226,232,240,.5)", fontFamily: "'Inter',sans-serif" }}>{s.l}</div>
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
            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Solicita tu propuesta</h3>
            <p className="text-xs mb-5" style={{ color: "rgba(226,232,240,.45)", fontFamily: "'Inter',sans-serif" }}>Sin costo. Respondemos en menos de 2h.</p>
            <ContactForm compact onLead={onLead} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sectors Section ──────────────────────────────────────────────────────────
const SECTORS = [
  { icon: Building2, title: "Propiedad Horizontal", desc: "Conjuntos, edificios y urbanizaciones con soluciones perimetrales de seguridad completas." },
  { icon: Factory, title: "Sector Industrial", desc: "Bodegas y fábricas con CCTV HD, biometría de alta seguridad y cercas eléctricas." },
  { icon: ShoppingBag, title: "Sector Comercial", desc: "Locales y centros comerciales protegidos con alarmas conectadas a app móvil." },
  { icon: HomeIcon, title: "Entidades y Comunidades", desc: "Colegios, oficinas y barrios con alarmas comunitarias y videoporteros integrados." },
];

function SectoresSection() {
  return (
    <section className="py-24 px-6" style={{ background: "#ffffff" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#0b1a33", fontFamily: "'JetBrains Mono',monospace" }}>// COBERTURA</div>
          <h2 className="text-4xl font-extrabold" style={{ color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Soluciones para Cada Entorno
          </h2>
          <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#475569", fontFamily: "'Inter',sans-serif" }}>
            Más de una década protegiendo hogares, negocios e industrias en Colombia.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECTORS.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <TiltCard className="group p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full"
                style={{ background: "#f4f7fc", border: "1px solid #e2e8f0" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-blue-100" style={{ background: "#e8f0fe" }}>
                  <s.icon size={22} style={{ color: "#1565c0" }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b", fontFamily: "'Inter',sans-serif" }}>{s.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
const CHECKLIST_TABS = [
  { label: "Puertas Vehiculares", items: ["Verificación de ruidos, engrase y velocidad de pluma", "Comprobación de partes mecánicas", "Verificar fotoceldas y bandas anti-aplastamiento", "Control de voltajes y consumos eléctricos"] },
  { label: "Puertas Peatonales", items: ["Limpieza general del equipo y accesorios", "Calibración del recorrido de apertura y cierre", "Nivelación de hoja y accesorios mecánicos", "Comprobación y limpieza de lectores de acceso"] },
  { label: "Cámaras CCTV", items: ["Verificación y ajuste de posicionamiento", "Revisión de lente, enfoque e iris automático", "Limpieza interior y exterior del dispositivo", "Comprobación de grabación y software"] },
];

function StatsSection() {
  const { ref, visible } = useScrollReveal();
  const [activeTab, setActiveTab] = useState(0);
  const n1 = useCountUp(45, 1800, visible);
  const n2 = useCountUp(2, 1800, visible);

  return (
    <section className="py-24 px-6" style={{ background: "#0b1a33" }}>
      <div ref={ref} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <Reveal from="left">
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// IMPACTO OPERATIVO</div>
            <h2 className="text-4xl font-extrabold leading-tight" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Mantenimiento que<br />protege su inversión
            </h2>
          </Reveal>
          <div className="flex gap-10">
            <div>
              <div className="text-7xl font-black leading-none" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
                -{n1}%
              </div>
              <div className="text-sm mt-2" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>en costos por daños de emergencia</div>
            </div>
            <div>
              <div className="text-7xl font-black leading-none" style={{ color: "#ffb703", fontFamily: "'JetBrains Mono',monospace" }}>
                {n2}X
              </div>
              <div className="text-sm mt-2" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>extensión vida útil de equipos</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-md" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
            Realizamos revisiones preventivas dos veces al año para extender la vida útil de sus equipos. Nuestros técnicos certificados responden fallas críticas en menos de 24 horas.
          </p>
        </div>
        <Reveal from="right">
          <div className="rounded-3xl p-7" style={{ background: "rgba(6,15,30,.65)", border: "1px solid rgba(0,242,255,.12)", backdropFilter: "blur(12px)" }}>
            <h3 className="text-sm font-bold mb-5" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Checklist de Inspección Semestral</h3>
            <div className="flex gap-2 flex-wrap mb-5">
              {CHECKLIST_TABS.map((t, i) => (
                <button key={t.label} onClick={() => setActiveTab(i)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: activeTab === i ? "#00f2ff" : "rgba(0,242,255,.06)", color: activeTab === i ? "#060f1e" : "rgba(226,232,240,.6)", border: "1px solid rgba(0,242,255,.18)", fontFamily: "'Inter',sans-serif" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              {CHECKLIST_TABS[activeTab].items.map(item => (
                <li key={item} className="flex items-start gap-3">
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
const SVC_CARDS = [
  { icon: Camera, title: "Sistemas CCTV", desc: "Videovigilancia HD con grabación continua, visión nocturna y monitoreo remoto 24/7.", page: "instalacion" as Page },
  { icon: Lock, title: "Control de Acceso", desc: "Biometría, talanqueras, lectoras de proximidad y torniquetes para peatones y vehículos.", page: "instalacion" as Page },
  { icon: Bell, title: "Alarmas Inteligentes", desc: "Detección de intrusión con sensores de movimiento, contactos magnéticos y app móvil.", page: "instalacion" as Page },
  { icon: Zap, title: "Cerca Eléctrica", desc: "Barreras perimetrales de alta tensión que disuaden y alertan ante cualquier intento de acceso.", page: "instalacion" as Page },
  { icon: Wrench, title: "Mantenimiento Preventivo", desc: "Rutinas semestrales certificadas para mantener todos sus equipos al 100% de rendimiento.", page: "mantenimiento" as Page },
  { icon: Settings, title: "Mantenimiento Correctivo", desc: "Diagnóstico y reparación inmediata de fallas críticas con garantía en el servicio.", page: "mantenimiento" as Page },
];

function ServicesGrid({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section className="py-24 px-6" style={{ background: "#ffffff" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#0b1a33", fontFamily: "'JetBrains Mono',monospace" }}>// SERVICIOS</div>
            <h2 className="text-4xl font-extrabold" style={{ color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Portafolio Completo</h2>
          </div>
          <button onClick={() => setPage("contacto")} className="flex items-center gap-2 font-semibold text-sm transition-colors hover:underline" style={{ color: "#1565c0", fontFamily: "'Inter',sans-serif" }}>
            Solicitar cotización <ArrowRight size={16} />
          </button>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SVC_CARDS.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <TiltCard onClick={() => setPage(s.page)} className="group text-left p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer h-full anim-border-pulse"
                style={{ background: "#060f1e", border: "1px solid rgba(0,242,255,.08)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-200 group-hover:scale-110"
                  style={{ background: "rgba(0,242,255,.07)", border: "1px solid rgba(0,242,255,.14)" }}>
                  <s.icon size={20} style={{ color: "#00f2ff" }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b", fontFamily: "'Inter',sans-serif" }}>{s.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold transition-colors group-hover:text-white" style={{ color: "#00f2ff", fontFamily: "'Inter',sans-serif" }}>
                  Ver detalle <ChevronRight size={14} />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #060f1e 0%, #0b1a33 50%, #060f1e 100%)" }}>
      <ParticleCanvas density={30} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,242,255,.05) 0%, transparent 65%)" }} />
      <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="text-xs font-bold tracking-[.2em] uppercase mb-4" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// CONTÁCTENOS</div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          ¿Listo para blindar<br />lo que más importa?
        </h2>
        <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
          Ingenieros certificados disponibles para visitar su propiedad y diseñar la solución de seguridad perfecta.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => setPage("contacto")} className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:brightness-110"
            style={{ background: "#ffb703", color: "#060f1e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Solicitar cotización →
          </button>
          <a href="tel:+573158006089" className="px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 flex items-center gap-2"
            style={{ border: "1px solid rgba(0,242,255,.35)", color: "#00f2ff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <Phone size={16} /> 315 800 6089
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ content, onLead, setPage }: { content: SiteContent; onLead: (l: Lead) => void; setPage: (p: Page) => void }) {
  return (
    <>
      <HeroSection content={content} onLead={onLead} />
      <SectoresSection />
      <StatsSection />
      <ServicesGrid setPage={setPage} />
      <CTABanner setPage={setPage} />
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
const INSTALL_SVCS = [
  { icon: Camera, title: "CCTV – Circuito Cerrado de Televisión", tag: "CCTV", desc: "Sistemas de videovigilancia que supervisar, controlan y aseguran su propiedad las 24 horas. Grabación continua con acceso remoto desde cualquier dispositivo.", objectives: ["Registro exacto de todo evento o suceso", "Visualización remota desde celular o computador", "Pruebas claras utilizables como evidencia legal", "Prevención de robos y actos delincuenciales", "Supervisión permanente sin importar el horario"], imageUrl: "/imagen 8.png" },
  { icon: Lock, title: "Control de Acceso y Biometría", tag: "ACCESO", desc: "Sistemas biométricos, talanqueras vehiculares y torniquetes peatonales para controlar el ingreso de personas y vehículos a su propiedad.", objectives: ["Identificación por huella dactilar, facial o tarjeta", "Control total del ingreso peatonal y vehicular", "Registro histórico de entradas y salidas", "Neutralización inmediata de accesos no autorizados", "Integración con cámaras y alarmas existentes"], imageUrl: "/imagen 3.png" },
  { icon: Eye, title: "Automatización de Puertas", tag: "PUERTAS", desc: "Puertas vehiculares y peatonales automatizadas con sensores de movimiento para un control fluido, seguro y eficiente del acceso.", objectives: ["Apertura suave y controlada sin contacto manual", "Neutraliza ingreso de amenazas externas", "Reducción de accidentes en zonas de tráfico vehicular", "Integración con control de acceso biométrico", "Mayor comodidad y eficiencia operativa"], imageUrl: "/imagen 15.png" },
  { icon: Bell, title: "Alarmas Residenciales y Comerciales", tag: "ALARMAS", desc: "Sistemas de detección con sensores de movimiento y cierres magnéticos que disparan sirenas y alertas inmediatas al celular mediante app móvil.", objectives: ["Aviso inmediato ante presencia de intrusos", "Detección de eventos atípicos en tiempo real", "Notificaciones a celulares programados vía app", "Disuasión efectiva de actos delictivos"], imageUrl: "/imagen 16.png" },
  { icon: Radio, title: "Alarmas Comunitarias", tag: "COMUNIDAD", desc: "Red de alarmas interconectadas que protegen comunidades enteras. Se activan vía app móvil y advierten a todos los vecinos sobre emergencias en el área.", objectives: ["Reducción de la delincuencia en barrios", "Activación remota desde app móvil individual", "Alertas de emergencia en toda el área de cobertura", "Fomento de la seguridad colaborativa vecinal"], imageUrl: "/imagen 12.png" },
  { icon: Zap, title: "Cercas Eléctricas", tag: "PERÍMETRO", desc: "Barreras físicas de alta tensión instaladas en el perímetro de su propiedad. Disuaden intrusos al instante y activan alarmas ante cualquier contacto.", objectives: ["Protección continua del perímetro los 365 días", "Detección inmediata de intento de penetración", "Disuasión psicológica efectiva para intrusos", "Calibración precisa de voltaje de seguridad"], imageUrl: "/imagen 11.png" },
];

function InstalacionPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <>
      <PageHeader tag="// INSTALACIÓN" title="Sistemas de Instalación Integrada" subtitle="Instalamos tecnología de punta para supervisar, controlar y proteger su hogar, empresa o comunidad." />
      <section className="py-16 px-6" style={{ background: "#060f1e" }}>
        <div className="max-w-7xl mx-auto space-y-20">
          {INSTALL_SVCS.map((svc, i) => (
            <Reveal key={svc.title} from={i % 2 === 0 ? "left" : "right"}>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative rounded-2xl overflow-hidden bg-slate-800" style={{ aspectRatio: "16/10" }}>
                  <img src={svc.imageUrl} alt={svc.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,15,30,.75) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(0,242,255,.12)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>{svc.tag}</span>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,242,255,.07)", border: "1px solid rgba(0,242,255,.14)" }}>
                    <svc.icon size={20} style={{ color: "#00f2ff" }} />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{svc.title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{svc.desc}</p>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>Beneficios clave:</p>
                    <ul className="space-y-2">{svc.objectives.map(o => (
                      <li key={o} className="flex items-start gap-3">
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} />
                        <span className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{o}</span>
                      </li>
                    ))}</ul>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CTABanner setPage={setPage} />
    </>
  );
}

// ─── Mantenimiento Page ───────────────────────────────────────────────────────
const MANT_CATS = [
  { title: "Cámaras", icon: Camera, items: ["Verificación y ajuste de posicionamiento", "Revisión de lente, enfoque e iris automático", "Comprobación con controlador/software", "Limpieza interior y exterior", "Cambio de accesorios para mejoramiento"] },
  { title: "Control de Acceso", icon: Lock, items: ["Comprobación de parámetros de controladoras", "Verificación de registros de acceso", "Engrase de elementos mecánicos", "Limpieza de lectores biométricos", "Revisión de cableado y alimentaciones"] },
  { title: "Puertas Vehiculares", icon: Eye, items: ["Verificación de ruidos, engrase y pluma", "Comprobación de partes mecánicas", "Verificar fotoceldas y bandas de seguridad", "Chequeo de instalación eléctrica", "Control de voltajes y consumos"] },
  { title: "Puertas Peatonales", icon: Users, items: ["Limpieza general del equipo", "Calibración de apertura y cierre", "Nivelación de hoja y accesorios mecánicos", "Comprobación de lectores de acceso", "Detección de anomalías en tornos"] },
  { title: "Alarmas", icon: Bell, items: ["Revisión de sensores infrarrojos", "Mantenimiento de cierres magnéticos", "Revisión y mantenimiento de sirenas", "Central y discador de comunicación", "Revisión de batería y cableado"] },
  { title: "Cerca Eléctrica", icon: Zap, items: ["Revisión y mantenimiento de la central", "Calibración de voltaje del sistema", "Revisión de postes y alambrado", "Ajuste de tensiómetro a las cuerdas", "Aislante de alambres perimetrales"] },
];

function MantenimientoPage({ setPage }: { setPage: (p: Page) => void }) {
  const [tab, setTab] = useState(0);
  return (
    <>
      <PageHeader tag="// MANTENIMIENTO" title="Servicio Técnico Especializado" subtitle="Mantenimientos preventivos y correctivos para extender la vida útil de todos sus equipos de seguridad." />
      <section className="py-16 px-6" style={{ background: "#060f1e" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {[
              { type: "PREVENTIVO", color: "#00f2ff", icon: Shield, headline: "Mantenimientos Preventivos", body: "Realizados dos veces al año para extender la vida útil de sus equipos y prevenir fallas costosas.", stat: "2X", statLabel: "vida útil de equipos", imageUrl: "/imagen 13.jpg" },
              { type: "CORRECTIVO", color: "#ffb703", icon: Wrench, headline: "Mantenimientos Correctivos", body: "Diagnóstico y reparación inmediata de fallas en equipos que han dejado de funcionar.", stat: "-45%", statLabel: "costos de emergencia", imageUrl: "/imagen 17.png" },
            ].map((c, i) => (
              <Reveal key={c.type} from={i === 0 ? "left" : "right"}>
                <TiltCard className="relative rounded-3xl overflow-hidden" style={{ border: `1px solid ${c.color}22`, minHeight: 280 }}>
                  <div className="absolute inset-0 bg-slate-900">
                    <img src={c.imageUrl} alt={c.headline} className="w-full h-full object-cover opacity-25" />
                  </div>
                  <div className="relative z-10 p-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${c.color}18`, border: `1px solid ${c.color}33` }}>
                      <c.icon size={22} style={{ color: c.color }} />
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
            ))}
          </div>

          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Protocolo por Equipo</h2>
            <p className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>Seleccione el sistema para ver el protocolo de inspección completo.</p>
          </Reveal>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {MANT_CATS.map((c, i) => (
              <button key={c.title} onClick={() => setTab(i)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: tab === i ? "#00f2ff" : "rgba(0,242,255,.06)", color: tab === i ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${tab === i ? "#00f2ff" : "rgba(0,242,255,.15)"}`, fontFamily: "'Inter',sans-serif" }}>
                <c.icon size={14} />{c.title}
              </button>
            ))}
          </div>
          <Reveal>
            <div className="max-w-2xl mx-auto rounded-3xl p-8" style={{ background: "rgba(11,26,51,.65)", border: "1px solid rgba(0,242,255,.12)", backdropFilter: "blur(12px)" }}>
              {(() => { const C = MANT_CATS[tab].icon; return (
                <div className="flex items-center gap-3 mb-6">
                  <C size={22} style={{ color: "#00f2ff" }} />
                  <h3 className="text-lg font-bold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Mantenimiento: {MANT_CATS[tab].title}</h3>
                </div>
              ); })()}
              <ul className="space-y-3">
                {MANT_CATS[tab].items.map(item => (
                  <li key={item} className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid rgba(0,242,255,.05)" }}>
                    <CheckCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} />
                    <span className="text-sm" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
      <CTABanner setPage={setPage} />
    </>
  );
}

// ─── Galería Técnica (Portafolio Interactivo) ────────────────────────────────
type GalleryCategoryId = "alturas" | "redes" | "control" | "acceso" | "cobertura";

interface GalleryCategory { id: GalleryCategoryId; label: string; icon: typeof HardHat }

const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: "alturas", label: "Alturas & Fachadas", icon: HardHat },
  { id: "redes", label: "Redes & CCTV", icon: Server },
  { id: "control", label: "Centro de Monitoreo", icon: MonitorPlay },
  { id: "acceso", label: "Control de Acceso", icon: DoorClosed },
  { id: "cobertura", label: "Cobertura Bogotá", icon: MapPinned },
];

interface GalleryItem { id: string; src: string; category: GalleryCategoryId; alt: string; size: "big" | "wide" | "normal" }

const GALLERY_ITEMS: GalleryItem[] = [
  { id: "g1", src: "/imagen 1.png", category: "alturas", size: "big", alt: "Técnico de LUEDMON realizando cableado estructurado en la fachada alta de un edificio residencial en Bogotá" },
  { id: "g2", src: "/imagen 2.png", category: "alturas", size: "normal", alt: "Instalación de cableado y tuberías de seguridad electrónica a nivel de piso en exteriores" },
  { id: "g13", src: "/imagen 13.jpg", category: "alturas", size: "wide", alt: "Técnico de alturas verificando la parte alta de la fachada de una infraestructura protegida" },

  { id: "g6", src: "/imagen 6.png", category: "redes", size: "big", alt: "Técnico configurando rack de comunicaciones con cableado estructurado y switches de red de gran escala" },
  { id: "g17", src: "/imagen 17.png", category: "redes", size: "normal", alt: "Revisión técnica de rack de servidores y equipos de red para CCTV" },
  { id: "g7", src: "/imagen 7.png", category: "redes", size: "normal", alt: "Ajuste de soporte metálico para montaje de equipos de videovigilancia" },
  { id: "g11", src: "/imagen 11.png", category: "redes", size: "wide", alt: "Conexiones eléctricas y electrónicas en caja de paso del sistema de seguridad" },

  { id: "g8", src: "/imagen 8.png", category: "control", size: "big", alt: "Operario de LUEDMON en centro de control con monitoreo de cámaras 24/7" },
  { id: "g16", src: "/imagen 16.png", category: "control", size: "wide", alt: "Estación de monitoreo con mapa digital y flujos de cámaras de seguridad en tiempo real" },

  { id: "g3", src: "/imagen 3.png", category: "acceso", size: "big", alt: "Instalación de brazo de talanquera vehicular automática en parqueadero" },
  { id: "g4", src: "/imagen 4.png", category: "acceso", size: "normal", alt: "Ajuste del sistema interior del gabinete de una talanquera automática" },
  { id: "g14", src: "/imagen 14.png", category: "acceso", size: "normal", alt: "Adecuación de obra civil con malla de refuerzo en rampa de acceso vehicular" },
  { id: "g15", src: "/imagen 15.png", category: "acceso", size: "wide", alt: "Vista general de rampa y pasillo técnico de acceso vehicular bajo supervisión" },

  { id: "g9", src: "/imagen 9.png", category: "cobertura", size: "big", alt: "Fijación de tuberías metálicas en el techo de una infraestructura de seguridad" },
  { id: "g10", src: "/imagen 10.png", category: "cobertura", size: "normal", alt: "Acceso peatonal con equipos de control de acceso integrados en copropiedad de Bogotá" },
  { id: "g12", src: "/imagen 12.png", category: "cobertura", size: "wide", alt: "Técnicos de LUEDMON coordinando instalación de seguridad electrónica en entorno urbano de Bogotá" },
];

const GALLERY_VIDEOS = [
  { id: "v1", src: encodeURI("/VID-20240921-WA0005.mp4"), label: "Instalación en sitio", desc: "Caso de éxito en video" },
  { id: "v2", src: encodeURI("/WhatsApp Video 2026-01-10 at 8.55.30 AM.mp4"), label: "Puesta en marcha", desc: "Sistema de seguridad operativo" },
];

const GALLERY_SIZE_CLASSES: Record<GalleryItem["size"], string> = {
  big: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  normal: "col-span-1 row-span-1",
};

function GalleryLightbox({ items, index, onClose, onNav }: { items: GalleryItem[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
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
  const cat = GALLERY_CATEGORIES.find(c => c.id === item.category)!;

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
          <img src={item.src} alt={item.alt} className="w-full max-h-[70vh] object-contain" style={{ background: "#000" }} />
        </div>
        <div className="mt-4 flex items-center gap-3 justify-center text-center flex-wrap">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase flex items-center gap-1.5" style={{ background: "rgba(0,242,255,.12)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
            <cat.icon size={11} />{cat.label}
          </span>
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
          <video src={src} controls autoPlay playsInline className="w-full max-h-[70vh]" style={{ background: "#000" }} />
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
        <video src={src} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-45 transition-opacity duration-300 group-hover:opacity-65" />
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

function GallerySection() {
  const [filter, setFilter] = useState<"todos" | GalleryCategoryId>("todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const filtered = filter === "todos" ? GALLERY_ITEMS : GALLERY_ITEMS.filter(i => i.category === filter);

  return (
    <section className="py-16 px-6" style={{ background: "#060f1e" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-10">
          <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// GALERÍA </div>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Trabajo en Terreno — Bogotá</h2>
          <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>Registro fotográfico de nuestras instalaciones: alturas, redes, monitoreo, control de acceso y cobertura en Bogotá.</p>
        </Reveal>

        {/* Filter tabs */}
        <div className="flex gap-2 justify-center mb-10 flex-wrap">
          <button onClick={() => setFilter("todos")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{ background: filter === "todos" ? "#00f2ff" : "rgba(0,242,255,.07)", color: filter === "todos" ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${filter === "todos" ? "#00f2ff" : "rgba(0,242,255,.18)"}`, fontFamily: "'Inter',sans-serif" }}>
            Todos
          </button>
          {GALLERY_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: filter === c.id ? "#00f2ff" : "rgba(0,242,255,.07)", color: filter === c.id ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${filter === c.id ? "#00f2ff" : "rgba(0,242,255,.18)"}`, fontFamily: "'Inter',sans-serif" }}>
              <c.icon size={14} />{c.label}
            </button>
          ))}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-flow-row-dense gap-3 sm:gap-4 auto-rows-[150px] sm:auto-rows-[180px] lg:auto-rows-[210px]">
          {filtered.map((item, i) => {
            const cat = GALLERY_CATEGORIES.find(c => c.id === item.category)!;
            return (
              <Reveal key={item.id} delay={(i % 8) * 45} className={GALLERY_SIZE_CLASSES[item.size]}>
                <TiltCard onClick={() => setLightboxIndex(i)} className="group relative w-full h-full rounded-2xl overflow-hidden cursor-pointer" style={{ border: "1px solid rgba(0,242,255,.1)" }}>
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(6,15,30,.95) 0%, rgba(6,15,30,.15) 55%, transparent 100%)" }} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,242,255,.18)", border: "1px solid rgba(0,242,255,.4)", backdropFilter: "blur(4px)" }}>
                      <Maximize2 size={16} style={{ color: "#00f2ff" }} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase inline-flex items-center gap-1" style={{ background: "rgba(0,242,255,.16)", border: "1px solid rgba(0,242,255,.35)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
                      <cat.icon size={9} />{cat.label}
                    </span>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Videos complementarios */}
        <div className="mt-16">
          <Reveal className="text-center mb-8">
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-2" style={{ color: "#ffb703", fontFamily: "'JetBrains Mono',monospace" }}>// CASOS EN VIDEO</div>
            <h3 className="text-2xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Véalo en Acción</h3>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {GALLERY_VIDEOS.map(v => <VideoCard key={v.id} src={v.src} label={v.label} desc={v.desc} />)}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox items={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={setLightboxIndex} />
      )}
    </section>
  );
}

// ─── Proyectos Page ───────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = { residencial: "Residencial", comercial: "Comercial", industrial: "Industrial" };

function ProyectosPage({ projects, setPage }: { projects: Project[]; setPage: (p: Page) => void }) {
  const [filter, setFilter] = useState("todos");
  const filtered = filter === "todos" ? projects : projects.filter(p => p.category === filter);
  return (
    <>
      <PageHeader tag="// PROYECTOS" title="Casos de Éxito" subtitle="Proyectos de instalación y mantenimiento en los sectores residencial, comercial e industrial de Colombia." />
      <GallerySection />
      <section className="py-16 px-6" style={{ background: "#0b1a33" }}>
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="text-xs font-bold tracking-[.2em] uppercase mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// PORTAFOLIO</div>
            <h2 className="text-3xl font-extrabold" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Proyectos por Sector</h2>
          </Reveal>
          <div className="flex gap-3 justify-center mb-12 flex-wrap">
            {["todos", "residencial", "comercial", "industrial"].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className="px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-all"
                style={{ background: filter === cat ? "#00f2ff" : "rgba(0,242,255,.07)", color: filter === cat ? "#060f1e" : "rgba(226,232,240,.7)", border: `1px solid ${filter === cat ? "#00f2ff" : "rgba(0,242,255,.18)"}`, fontFamily: "'Inter',sans-serif" }}>
                {cat === "todos" ? "Todos" : CAT_LABELS[cat]}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: "#334155" }}>
              <ImageIcon size={40} className="mx-auto mb-4" />
              <p style={{ fontFamily: "'Inter',sans-serif" }}>No hay proyectos en esta categoría todavía.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <TiltCard className="group relative rounded-2xl overflow-hidden bg-slate-800 cursor-default" style={{ aspectRatio: "4/3" }}>
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,15,30,.96) 0%, rgba(6,15,30,.4) 55%, transparent 100%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: "rgba(0,242,255,.14)", border: "1px solid rgba(0,242,255,.3)", color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>
                        {p.category}
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
      <CTABanner setPage={setPage} />
    </>
  );
}

// ─── Contacto Page ────────────────────────────────────────────────────────────
function ContactoPage({ content, onLead }: { content: SiteContent; onLead: (l: Lead) => void }) {
  return (
    <>
      <PageHeader tag="// SEDE CENTRAL" title="Contáctenos" subtitle="Ingenieros certificados disponibles para visitar su propiedad y diseñar la solución perfecta." />
      <section className="py-16 px-6" style={{ background: "#060f1e" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-5">
            <Reveal>
              <h2 className="text-2xl font-extrabold mb-6" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Información de Contacto</h2>
            </Reveal>
            {[
              { icon: Phone, label: "Línea Principal", value: `+57 ${content.phone1}`, href: `tel:+57${content.phone1.replace(/-/g, "")}` },
              { icon: Phone, label: "Línea Alterna", value: `+57 ${content.phone2}`, href: `tel:+57${content.phone2.replace(/-/g, "")}` },
              { icon: Mail, label: "Correo Electrónico", value: content.email, href: `mailto:${content.email}` },
              { icon: MapPin, label: "Dirección", value: `${content.address}, Colombia`, href: "#" },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <a href={item.href} className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group"
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
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// REDES SOCIALES</p>
                <div className="flex gap-3">
                  {[{ n: "Instagram", h: "@Luedmon.Seguridad" }, { n: "Facebook", h: "@Luedmon.Seguridad" }].map(s => (
                    <a key={s.n} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex-1 p-4 rounded-2xl text-center transition-all hover:-translate-y-0.5"
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
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Solicitar Cotización</h3>
              <p className="text-sm mb-7" style={{ color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
                Cuéntenos su proyecto. Respondemos en menos de 2 horas hábiles.
              </p>
              <ContactForm onLead={onLead} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage, content, onAdminOpen }: { setPage: (p: Page) => void; content: SiteContent; onAdminOpen: () => void }) {
  return (
    <footer style={{ background: "#010409" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <button onClick={() => { setPage("home"); window.scrollTo({ top: 0 }); }} className="flex items-center gap-3 mb-4">
              <img src="/logo-removebg-preview.png" alt="LUEDMON" className="h-[180px] w-auto brightness-0 invert" />
            </button>
            <p className="text-sm leading-relaxed text-slate-300" style={{ fontFamily: "'Inter',sans-serif" }}>
              Soluciones integrales en seguridad tecnológica con personal calificado y equipos certificados.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold mb-5 tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// NAVEGACIÓN</p>
            <ul className="space-y-3">
              {NAV_ITEMS.map(item => (
                <li key={item.page}>
                  <button onClick={() => { setPage(item.page); window.scrollTo({ top: 0 }); }} className="text-sm text-slate-300 transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold mb-5 tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// SERVICIOS</p>
            <ul className="space-y-3">
              {["Sistemas CCTV", "Control de Acceso", "Alarmas", "Cerca Eléctrica", "Mantenimiento"].map(s => (
                <li key={s}><button onClick={() => { setPage(s === "Mantenimiento" ? "mantenimiento" : "instalacion"); window.scrollTo({ top: 0 }); }} className="text-sm text-slate-300 transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>{s}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold mb-5 tracking-widest" style={{ color: "#00f2ff", fontFamily: "'JetBrains Mono',monospace" }}>// CONTACTO</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#00f2ff" }} /><span className="text-sm text-slate-300" style={{ fontFamily: "'Inter',sans-serif" }}>{content.address}</span></li>
              <li className="flex items-center gap-2"><Phone size={13} style={{ color: "#00f2ff" }} /><a href={`tel:+57${content.phone1.replace(/-/g, "")}`} className="text-sm text-slate-300 inline-flex transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>+57 {content.phone1}</a></li>
              <li className="flex items-center gap-2"><Phone size={13} style={{ color: "#00f2ff" }} /><a href={`tel:+57${content.phone2.replace(/-/g, "")}`} className="text-sm text-slate-300 inline-flex transition-all duration-300 hover:text-white hover:-translate-y-0.5" style={{ fontFamily: "'Inter',sans-serif" }}>+57 {content.phone2}</a></li>
              <li className="flex items-center gap-2"><Mail size={13} style={{ color: "#00f2ff" }} /><a href={`mailto:${content.email}`} className="text-sm text-slate-300 inline-flex transition-all duration-300 hover:text-white hover:-translate-y-0.5 break-all" style={{ fontFamily: "'Inter',sans-serif" }}>{content.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <p className="text-xs text-slate-400" style={{ fontFamily: "'Inter',sans-serif" }}>
            © 2026 LUEDMON — {content.tagline.toUpperCase()}. TODOS LOS DERECHOS RESERVADOS.
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
  const [appState, setAppState] = usePersistedState();
  const [activePage, setActivePage] = useState<Page>("home");
  const [adminOpen, setAdminOpen] = useState(false);

  const setPage = (p: Page) => { setActivePage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const addLead = useCallback((lead: Lead) => {
    setAppState(prev => ({ ...prev, leads: [...prev.leads, lead] }));
  }, [setAppState]);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.fontFamily = "'Inter', sans-serif";
  }, []);

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{CSS_ANIMS}</style>

      <div className="min-h-screen" style={{ background: "#060f1e" }}>
        <Navbar activePage={activePage} setPage={setPage} tagline={appState.content.tagline} />

        <main>
          {activePage === "home" && <HomePage content={appState.content} onLead={addLead} setPage={setPage} />}
          {activePage === "instalacion" && <InstalacionPage setPage={setPage} />}
          {activePage === "mantenimiento" && <MantenimientoPage setPage={setPage} />}
          {activePage === "proyectos" && <ProyectosPage projects={appState.projects} setPage={setPage} />}
          {activePage === "contacto" && <ContactoPage content={appState.content} onLead={addLead} />}
        </main>

        <Footer setPage={setPage} content={appState.content} onAdminOpen={() => setAdminOpen(true)} />
        <WhatsAppFloat />
      </div>

      {adminOpen && (
        <AdminModal appState={appState} setAppState={setAppState} onClose={() => setAdminOpen(false)} />
      )}
    </>
  );
}
