import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, Bell, FileText, Image as ImageIcon, Settings, Key, Home, Wrench, Camera, Phone, Mail,
  Globe, FolderOpen, Trash2, Plus, ChevronUp, ChevronDown, ChevronRight, X, LogOut, Save, Upload,
  Link as LinkIcon, Loader2, RotateCcw, Copy, Check, AlertTriangle,
} from "lucide-react";
import { api, ApiError, type Lead, type MediaFile } from "../api";
import {
  BUILTIN_MEDIA, DEFAULT_SITE, ICONS, TEXT_GROUPS, iconFor, isVideo, mediaSrc, mergeSite,
  type Page, type SiteData, type TextGroup,
} from "../siteData";

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const C = { cyan: "#00f2ff", amber: "#ffb703", green: "#10b981", red: "#fca5a5", text: "#e2e8f0", muted: "#94a3b8", dim: "#475569" };
const F = { head: "'Plus Jakarta Sans',sans-serif", body: "'Inter',sans-serif", mono: "'JetBrains Mono',monospace" };
const inputCls = "w-full px-3 py-2.5 rounded-xl outline-none text-sm";
const inputStyle: React.CSSProperties = { background: "rgba(0,242,255,.04)", border: "1px solid rgba(0,242,255,.18)", color: C.text, fontFamily: F.body };
const cardStyle: React.CSSProperties = { background: "rgba(11,26,51,.5)", border: "1px solid rgba(0,242,255,.08)" };
const PAGE_OPTIONS: { value: Page; label: string }[] = [
  { value: "home", label: "Principal" }, { value: "instalacion", label: "Instalación" },
  { value: "mantenimiento", label: "Mantenimiento" }, { value: "proyectos", label: "Proyectos" },
  { value: "contacto", label: "Contacto" },
];
const TOKEN_KEY = "luedmon_admin_token";

// ─── Contexto de sesión ───────────────────────────────────────────────────────
interface AdminCtx { token: string; handleError: (e: unknown) => string }
const Ctx = createContext<AdminCtx>({ token: "", handleError: () => "" });
const useAdmin = () => useContext(Ctx);

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold block mb-1.5" style={{ color: C.cyan, fontFamily: F.mono }}>{children}</label>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold tracking-widest mb-3" style={{ color: C.muted, fontFamily: F.mono }}>// {children}</p>;
}

function Btn({ children, onClick, variant = "ghost", disabled, type = "button", title }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "amber" | "ghost" | "danger";
  disabled?: boolean; type?: "button" | "submit"; title?: string;
}) {
  const styles = {
    primary: { background: C.cyan, color: "#060f1e" },
    amber: { background: C.amber, color: "#060f1e" },
    ghost: { background: "rgba(255,255,255,.05)", color: C.muted },
    danger: { background: "rgba(239,68,68,.12)", color: C.red },
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ ...styles, fontFamily: F.body }}>
      {children}
    </button>
  );
}

// ─── Campos básicos ───────────────────────────────────────────────────────────
function TextInput({ label, value, onChange, multiline, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {multiline
        ? <textarea className={inputCls} style={inputStyle} rows={3} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        : <input className={inputCls} style={inputStyle} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: {
  label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select className={inputCls} style={{ ...inputStyle, cursor: "pointer" }} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value} className="text-slate-900">{o.label}</option>)}
      </select>
    </div>
  );
}

function IconPicker({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const Current = iconFor(value);
  return (
    <div>
      {label && <Label>{label}</Label>}
      <button type="button" onClick={() => setOpen(o => !o)} className={`${inputCls} flex items-center gap-2`} style={inputStyle}>
        <Current size={16} style={{ color: C.cyan }} /> <span>{value}</span>
        <ChevronDown size={14} className="ml-auto" />
      </button>
      {open && (
        <div className="grid grid-cols-8 gap-1 p-2 mt-1 rounded-xl" style={{ background: "#071426", border: "1px solid rgba(0,242,255,.18)" }}>
          {Object.entries(ICONS).map(([name, Icon]) => (
            <button key={name} type="button" title={name} onClick={() => { onChange(name); setOpen(false); }}
              className="aspect-square rounded-lg flex items-center justify-center hover:brightness-150"
              style={{ background: name === value ? "rgba(0,242,255,.18)" : "rgba(255,255,255,.03)" }}>
              <Icon size={16} style={{ color: name === value ? C.cyan : C.muted }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StringList({ label, items, onChange, multiline }: { label?: string; items: string[]; onChange: (v: string[]) => void; multiline?: boolean }) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              {multiline
                ? <textarea className={inputCls} style={inputStyle} rows={2} value={item} onChange={e => set(i, e.target.value)} />
                : <input className={inputCls} style={inputStyle} value={item} onChange={e => set(i, e.target.value)} />}
            </div>
            <IconBtn onClick={() => move(i, -1)} title="Subir"><ChevronUp size={14} /></IconBtn>
            <IconBtn onClick={() => move(i, 1)} title="Bajar"><ChevronDown size={14} /></IconBtn>
            <IconBtn onClick={() => onChange(items.filter((_, j) => j !== i))} title="Eliminar" danger><Trash2 size={14} /></IconBtn>
          </div>
        ))}
        <Btn onClick={() => onChange([...items, ""])}><Plus size={14} /> Agregar</Btn>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title}
      className="w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center transition-all hover:brightness-150"
      style={{ background: danger ? "rgba(239,68,68,.12)" : "rgba(0,242,255,.06)", color: danger ? C.red : C.muted }}>
      {children}
    </button>
  );
}

// ─── Imágenes y videos ────────────────────────────────────────────────────────
function MediaPreview({ src, className = "", style }: { src: string; className?: string; style?: React.CSSProperties }) {
  if (!src) return <div className={`flex items-center justify-center ${className}`} style={{ background: "#0b1a33", color: C.dim, ...style }}><ImageIcon size={20} /></div>;
  return isVideo(src)
    ? <video src={mediaSrc(src)} muted playsInline className={`object-cover ${className}`} style={{ background: "#000", ...style }} />
    : <img src={mediaSrc(src)} alt="" className={`object-cover ${className}`} style={{ background: "#0b1a33", ...style }} />;
}

function useUploader() {
  const { token, handleError } = useAdmin();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const uploadFile = async (file: File) => {
    setError(""); setProgress(0);
    try {
      return await api.uploadFile(token, file, setProgress);
    } catch (e) {
      setError(handleError(e));
      return null;
    } finally {
      setProgress(null);
    }
  };
  return { uploadFile, progress, error };
}

function MediaField({ label, value, onChange, kind = "image" }: {
  label?: string; value: string; onChange: (v: string) => void; kind?: "image" | "video";
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [libOpen, setLibOpen] = useState(false);
  const { uploadFile, progress, error } = useUploader();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    const url = await uploadFile(file);
    if (url) onChange(url);
  };
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex gap-3 items-start">
        <MediaPreview src={value} className="w-24 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="relative">
            <LinkIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.dim }} />
            <input className={inputCls} style={{ ...inputStyle, paddingLeft: 30 }} value={value}
              placeholder={kind === "video" ? "Link del video (.mp4)" : "Link de la imagen (https://...)"}
              onChange={e => onChange(e.target.value.trim())} />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Btn onClick={() => fileRef.current?.click()} disabled={progress !== null}>
              {progress !== null ? <><Loader2 size={14} className="animate-spin" /> Subiendo {Math.round(progress)}%</> : <><Upload size={14} /> Subir archivo</>}
            </Btn>
            <Btn onClick={() => setLibOpen(true)}><FolderOpen size={14} /> Biblioteca</Btn>
            <input ref={fileRef} type="file" hidden accept={kind === "video" ? "video/*" : "image/*"} onChange={onFile} />
          </div>
          {error && <p className="text-xs" style={{ color: C.red }}>{error}</p>}
        </div>
      </div>
      {libOpen && <MediaLibraryModal kind={kind} onPick={url => { onChange(url); setLibOpen(false); }} onClose={() => setLibOpen(false)} />}
    </div>
  );
}

function MediaLibrary({ kind, onPick }: { kind?: "image" | "video"; onPick?: (url: string) => void }) {
  const { token, handleError } = useAdmin();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadFile, progress, error } = useUploader();

  const load = useCallback(() => {
    api.listMedia(token).then(setFiles).catch(e => { setLoadError(handleError(e)); setFiles([]); });
  }, [token, handleError]);
  useEffect(load, [load]);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []); e.target.value = "";
    for (const f of list) await uploadFile(f);
    load();
  };
  const matches = (src: string) => !kind || (kind === "video") === isVideo(src);
  const all = [...(files ?? []).map(f => f.url), ...BUILTIN_MEDIA].filter(matches);
  const copy = (url: string) => {
    const abs = url.startsWith("/") ? location.origin + encodeURI(url) : url;
    navigator.clipboard?.writeText(abs).then(() => { setCopied(url); setTimeout(() => setCopied(""), 1500); });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Btn variant="primary" onClick={() => fileRef.current?.click()} disabled={progress !== null}>
          {progress !== null ? <><Loader2 size={14} className="animate-spin" /> Subiendo {Math.round(progress)}%</> : <><Upload size={14} /> Subir {kind === "video" ? "videos" : kind === "image" ? "imágenes" : "archivos"}</>}
        </Btn>
        <input ref={fileRef} type="file" hidden multiple accept={kind === "video" ? "video/*" : kind === "image" ? "image/*" : "image/*,video/*"} onChange={onFiles} />
        <span className="text-xs" style={{ color: C.dim, fontFamily: F.body }}>
          {onPick ? "Haz clic en un archivo para usarlo." : "Los archivos subidos quedan alojados en Vercel Blob."}
        </span>
      </div>
      {(error || loadError) && <p className="text-xs" style={{ color: C.red }}>{error || loadError}</p>}
      {files === null ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: C.muted }}><Loader2 size={16} className="animate-spin" /> Cargando…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {all.map(url => (
            <div key={url} className="rounded-xl overflow-hidden group relative" style={{ border: "1px solid rgba(0,242,255,.1)" }}>
              <button type="button" onClick={() => onPick ? onPick(url) : copy(url)} className="block w-full" title={onPick ? "Usar este archivo" : "Copiar link"}>
                <MediaPreview src={url} className="w-full h-28" />
              </button>
              <div className="flex items-center gap-2 px-2 py-1.5" style={{ background: "rgba(6,15,30,.9)" }}>
                <span className="text-[10px] truncate flex-1" style={{ color: C.muted, fontFamily: F.mono }}>
                  {decodeURIComponent(url.split("/").pop() ?? "")}
                </span>
                <button type="button" onClick={() => copy(url)} title="Copiar link" style={{ color: copied === url ? C.green : C.dim }}>
                  {copied === url ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaLibraryModal({ kind, onPick, onClose }: { kind: "image" | "video"; onPick: (url: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.75)" }} onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl p-6" style={{ background: "#060f1e", border: "1px solid rgba(0,242,255,.2)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: C.text, fontFamily: F.head }}>Biblioteca de {kind === "video" ? "videos" : "imágenes"}</h3>
          <IconBtn onClick={onClose} title="Cerrar"><X size={16} /></IconBtn>
        </div>
        <MediaLibrary kind={kind} onPick={onPick} />
      </div>
    </div>
  );
}

// ─── Editor genérico de listas ────────────────────────────────────────────────
type FieldDef<T> = {
  key: keyof T & string; label: string;
  type: "text" | "textarea" | "number" | "icon" | "image" | "video" | "strings" | "select";
  options?: { value: string; label: string }[];
};

function ObjectFields<T extends object>({ value, fields, onChange }: { value: T; fields: FieldDef<T>[]; onChange: (v: T) => void }) {
  const set = (k: keyof T, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {fields.map(f => {
        const v = value[f.key] as unknown;
        const wide = ["textarea", "image", "video", "strings"].includes(f.type);
        const el = (() => {
          switch (f.type) {
            case "text": return <TextInput label={f.label} value={String(v ?? "")} onChange={x => set(f.key, x)} />;
            case "textarea": return <TextInput label={f.label} value={String(v ?? "")} onChange={x => set(f.key, x)} multiline />;
            case "number": return (
              <div><Label>{f.label}</Label>
                <input type="number" className={inputCls} style={inputStyle} value={Number(v ?? 0)} onChange={e => set(f.key, Number(e.target.value))} />
              </div>
            );
            case "icon": return <IconPicker label={f.label} value={String(v ?? "")} onChange={x => set(f.key, x)} />;
            case "image": return <MediaField label={f.label} value={String(v ?? "")} onChange={x => set(f.key, x)} />;
            case "video": return <MediaField label={f.label} value={String(v ?? "")} onChange={x => set(f.key, x)} kind="video" />;
            case "strings": return <StringList label={f.label} items={(v as string[]) ?? []} onChange={x => set(f.key, x)} />;
            case "select": return <SelectInput label={f.label} value={String(v ?? "")} onChange={x => set(f.key, x)} options={f.options ?? []} />;
          }
        })();
        return <div key={f.key} className={wide ? "md:col-span-2" : ""}>{el}</div>;
      })}
    </div>
  );
}

function ListEditor<T extends object>({ title, hint, items, onChange, fields, newItem, itemLabel, itemThumb }: {
  title: string; hint?: string; items: T[]; onChange: (v: T[]) => void; fields: FieldDef<T>[];
  newItem: () => T; itemLabel: (item: T, i: number) => string; itemThumb?: (item: T) => string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; onChange(next);
    if (open === i) setOpen(j);
  };
  const remove = (i: number) => { onChange(items.filter((_, j) => j !== i)); setOpen(null); };
  return (
    <div className="p-5 rounded-2xl space-y-3" style={cardStyle}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <SectionTitle>{title.toUpperCase()}</SectionTitle>
          {hint && <p className="text-xs -mt-2" style={{ color: C.dim, fontFamily: F.body }}>{hint}</p>}
        </div>
        <Btn variant="primary" onClick={() => { onChange([...items, newItem()]); setOpen(items.length); }}><Plus size={14} /> Agregar</Btn>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl" style={{ background: "rgba(6,15,30,.6)", border: `1px solid ${open === i ? "rgba(0,242,255,.3)" : "rgba(0,242,255,.08)"}` }}>
            <div className="flex items-center gap-2 p-2">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <ChevronRight size={14} style={{ color: C.muted, transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                {itemThumb && <MediaPreview src={itemThumb(item)} className="w-12 h-8 rounded flex-shrink-0" />}
                <span className="text-sm truncate" style={{ color: C.text, fontFamily: F.body }}>{itemLabel(item, i) || <em style={{ color: C.dim }}>(sin título)</em>}</span>
              </button>
              <IconBtn onClick={() => move(i, -1)} title="Subir"><ChevronUp size={14} /></IconBtn>
              <IconBtn onClick={() => move(i, 1)} title="Bajar"><ChevronDown size={14} /></IconBtn>
              <IconBtn onClick={() => remove(i)} title="Eliminar" danger><Trash2 size={14} /></IconBtn>
            </div>
            {open === i && (
              <div className="p-4 pt-2">
                <ObjectFields value={item} fields={fields} onChange={v => onChange(items.map((x, j) => (j === i ? v : x)))} />
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs py-3 text-center" style={{ color: C.dim }}>Sin elementos.</p>}
      </div>
    </div>
  );
}

// ─── Grupos de textos ─────────────────────────────────────────────────────────
function TextGroups({ groups, draft, setDraft }: { groups: readonly TextGroup[]; draft: SiteData; setDraft: SetDraft }) {
  return (
    <>
      {groups.map(g => (
        <div key={g.title} className="p-5 rounded-2xl space-y-3" style={cardStyle}>
          <SectionTitle>{g.title.toUpperCase()}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {g.fields.map(([key, label, , multiline]) => (
              <div key={key} className={multiline ? "md:col-span-2" : ""}>
                <TextInput label={label} value={draft.text[key as keyof SiteData["text"]] ?? ""} multiline={multiline}
                  onChange={v => setDraft(d => ({ ...d, text: { ...d.text, [key]: v } }))} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

type SetDraft = (fn: (d: SiteData) => SiteData) => void;
const uid = () => Math.random().toString(36).slice(2, 9);
function listSetter<K extends keyof SiteData>(setDraft: SetDraft, key: K) {
  return (v: SiteData[K]) => setDraft(d => ({ ...d, [key]: v }));
}

// ─── Pestañas de contenido ────────────────────────────────────────────────────
function GeneralTab({ draft, setDraft }: { draft: SiteData; setDraft: SetDraft }) {
  const setMedia = (k: keyof SiteData["media"]) => (v: string) => setDraft(d => ({ ...d, media: { ...d.media, [k]: v } }));
  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl space-y-4" style={cardStyle}>
        <SectionTitle>LOGOS</SectionTitle>
        <MediaField label="Logo del menú y portada" value={draft.media.logo} onChange={setMedia("logo")} />
        <MediaField label="Logo del pie de página" value={draft.media.logoFooter} onChange={setMedia("logoFooter")} />
      </div>
      <TextGroups groups={TEXT_GROUPS.general} draft={draft} setDraft={setDraft} />
      <ListEditor title="Redes sociales" items={draft.socials} onChange={listSetter(setDraft, "socials")}
        fields={[{ key: "name", label: "Red", type: "text" }, { key: "handle", label: "Usuario", type: "text" }, { key: "href", label: "Link", type: "text" }]}
        newItem={() => ({ name: "", handle: "", href: "https://" })} itemLabel={s => s.name} />
      <div className="p-5 rounded-2xl" style={cardStyle}>
        <SectionTitle>SERVICIOS DEL FORMULARIO DE COTIZACIÓN</SectionTitle>
        <StringList items={draft.formServices} onChange={listSetter(setDraft, "formServices")} />
      </div>
      <ListEditor title="Servicios del pie de página" items={draft.footerServices} onChange={listSetter(setDraft, "footerServices")}
        fields={[{ key: "label", label: "Texto", type: "text" }, { key: "page", label: "Lleva a la página", type: "select", options: PAGE_OPTIONS }]}
        newItem={() => ({ label: "", page: "instalacion" as Page })} itemLabel={s => s.label} />
    </div>
  );
}

function InicioTab({ draft, setDraft }: { draft: SiteData; setDraft: SetDraft }) {
  const [hero, s2, s3, heroForm, sectors, stats, services, cta] = TEXT_GROUPS.inicio;
  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl space-y-4" style={cardStyle}>
        <SectionTitle>HERO – FONDO Y TÍTULO ANIMADO</SectionTitle>
        <MediaField label="Video de fondo del hero" kind="video" value={draft.media.heroVideo} onChange={v => setDraft(d => ({ ...d, media: { ...d.media, heroVideo: v } }))} />
        <StringList label="Frases que se escriben en el título (efecto máquina de escribir)" items={draft.heroPhrases} onChange={listSetter(setDraft, "heroPhrases")} />
      </div>
      <TextGroups groups={[hero, s2]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Slide 2 – Tarjetas" items={draft.slide2Cards} onChange={listSetter(setDraft, "slide2Cards")}
        fields={[{ key: "icon", label: "Icono", type: "icon" }, { key: "label", label: "Texto", type: "text" }]}
        newItem={() => ({ icon: "Shield", label: "" })} itemLabel={c => c.label} />
      <TextGroups groups={[s3]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Slide 3 – Cifras" items={draft.slide3Stats} onChange={listSetter(setDraft, "slide3Stats")}
        fields={[{ key: "value", label: "Cifra", type: "text" }, { key: "label", label: "Descripción", type: "text" }]}
        newItem={() => ({ value: "", label: "" })} itemLabel={c => `${c.value} ${c.label}`} />
      <TextGroups groups={[heroForm, sectors]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Sectores" items={draft.sectors} onChange={listSetter(setDraft, "sectors")}
        fields={[{ key: "icon", label: "Icono", type: "icon" }, { key: "title", label: "Título", type: "text" }, { key: "desc", label: "Descripción", type: "textarea" }]}
        newItem={() => ({ icon: "Building2", title: "", desc: "" })} itemLabel={s => s.title} />
      <TextGroups groups={[stats]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Cifras animadas" hint="El número cuenta desde 0 al hacer scroll." items={draft.impactStats} onChange={listSetter(setDraft, "impactStats")}
        fields={[{ key: "prefix", label: "Antes del número", type: "text" }, { key: "value", label: "Número", type: "number" }, { key: "suffix", label: "Después del número", type: "text" }, { key: "label", label: "Descripción", type: "text" }]}
        newItem={() => ({ prefix: "", value: 0, suffix: "", label: "" })} itemLabel={s => `${s.prefix}${s.value}${s.suffix} ${s.label}`} />
      <ListEditor title="Checklist de inspección (pestañas)" items={draft.checklist} onChange={listSetter(setDraft, "checklist")}
        fields={[{ key: "label", label: "Nombre de la pestaña", type: "text" }, { key: "items", label: "Puntos", type: "strings" }]}
        newItem={() => ({ label: "", items: [] })} itemLabel={c => c.label} />
      <TextGroups groups={[services]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Tarjetas de servicios" items={draft.serviceCards} onChange={listSetter(setDraft, "serviceCards")}
        fields={[{ key: "icon", label: "Icono", type: "icon" }, { key: "page", label: "Lleva a la página", type: "select", options: PAGE_OPTIONS }, { key: "title", label: "Título", type: "text" }, { key: "desc", label: "Descripción", type: "textarea" }]}
        newItem={() => ({ icon: "Shield", title: "", desc: "", page: "instalacion" as Page })} itemLabel={s => s.title} />
      <TextGroups groups={[cta]} draft={draft} setDraft={setDraft} />
    </div>
  );
}

function InstalacionTab({ draft, setDraft }: { draft: SiteData; setDraft: SetDraft }) {
  return (
    <div className="space-y-5">
      <TextGroups groups={TEXT_GROUPS.instalacion} draft={draft} setDraft={setDraft} />
      <ListEditor title="Servicios de instalación" items={draft.installServices} onChange={listSetter(setDraft, "installServices")}
        fields={[
          { key: "title", label: "Título", type: "text" }, { key: "tag", label: "Etiqueta sobre la imagen", type: "text" },
          { key: "icon", label: "Icono", type: "icon" }, { key: "imageUrl", label: "Imagen", type: "image" },
          { key: "desc", label: "Descripción", type: "textarea" }, { key: "objectives", label: "Beneficios", type: "strings" },
        ]}
        newItem={() => ({ icon: "Shield", title: "", tag: "", desc: "", objectives: [], imageUrl: "" })}
        itemLabel={s => s.title} itemThumb={s => s.imageUrl} />
    </div>
  );
}

function MantenimientoTab({ draft, setDraft }: { draft: SiteData; setDraft: SetDraft }) {
  const [header, protocol] = TEXT_GROUPS.mantenimiento;
  return (
    <div className="space-y-5">
      <TextGroups groups={[header]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Tarjetas preventivo / correctivo" items={draft.mantCards} onChange={listSetter(setDraft, "mantCards")}
        fields={[
          { key: "type", label: "Etiqueta", type: "text" }, { key: "icon", label: "Icono", type: "icon" },
          { key: "headline", label: "Título", type: "text" }, { key: "stat", label: "Cifra", type: "text" },
          { key: "statLabel", label: "Texto de la cifra", type: "text" }, { key: "body", label: "Descripción", type: "textarea" },
          { key: "imageUrl", label: "Imagen de fondo", type: "image" },
        ]}
        newItem={() => ({ type: "", icon: "Shield", headline: "", body: "", stat: "", statLabel: "", imageUrl: "" })}
        itemLabel={c => c.headline} itemThumb={c => c.imageUrl} />
      <TextGroups groups={[protocol]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Protocolos por equipo" items={draft.mantCategories} onChange={listSetter(setDraft, "mantCategories")}
        fields={[{ key: "title", label: "Equipo", type: "text" }, { key: "icon", label: "Icono", type: "icon" }, { key: "items", label: "Puntos de inspección", type: "strings" }]}
        newItem={() => ({ title: "", icon: "Wrench", items: [] })} itemLabel={c => c.title} />
    </div>
  );
}

function ProyectosTab({ draft, setDraft }: { draft: SiteData; setDraft: SetDraft }) {
  const [header, gallery, portfolio] = TEXT_GROUPS.proyectos;
  const catOptions = draft.galleryCategories.map(c => ({ value: c.id, label: c.label || c.id }));
  const t = draft.text;
  return (
    <div className="space-y-5">
      <TextGroups groups={[header, gallery]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Categorías de la galería" items={draft.galleryCategories} onChange={listSetter(setDraft, "galleryCategories")}
        fields={[{ key: "label", label: "Nombre", type: "text" }, { key: "icon", label: "Icono", type: "icon" }]}
        newItem={() => ({ id: `cat-${uid()}`, label: "", icon: "Camera" })} itemLabel={c => c.label} />
      <ListEditor title="Fotos de la galería" hint="Tamaño: grande = 2×2, ancha = 2×1, normal = 1×1." items={draft.galleryItems} onChange={listSetter(setDraft, "galleryItems")}
        fields={[
          { key: "src", label: "Imagen", type: "image" },
          { key: "category", label: "Categoría", type: "select", options: catOptions },
          { key: "size", label: "Tamaño", type: "select", options: [{ value: "big", label: "Grande" }, { value: "wide", label: "Ancha" }, { value: "normal", label: "Normal" }] },
          { key: "alt", label: "Descripción (se muestra al ampliar y ayuda al SEO)", type: "textarea" },
        ]}
        newItem={() => ({ id: `g-${uid()}`, src: "", category: draft.galleryCategories[0]?.id ?? "", alt: "", size: "normal" as const })}
        itemLabel={g => g.alt} itemThumb={g => g.src} />
      <ListEditor title="Videos" items={draft.galleryVideos} onChange={listSetter(setDraft, "galleryVideos")}
        fields={[{ key: "label", label: "Título", type: "text" }, { key: "desc", label: "Descripción", type: "text" }, { key: "src", label: "Video", type: "video" }]}
        newItem={() => ({ id: `v-${uid()}`, src: "", label: "", desc: "" })} itemLabel={v => v.label} itemThumb={v => v.src} />
      <TextGroups groups={[portfolio]} draft={draft} setDraft={setDraft} />
      <ListEditor title="Proyectos por sector" items={draft.projects} onChange={listSetter(setDraft, "projects")}
        fields={[
          { key: "title", label: "Título", type: "text" },
          { key: "category", label: "Sector", type: "select", options: [
            { value: "residencial", label: t.cat_residencial }, { value: "comercial", label: t.cat_comercial }, { value: "industrial", label: t.cat_industrial },
          ] },
          { key: "items", label: "Sistemas instalados (ej: CCTV · Alarma)", type: "text" },
          { key: "imageUrl", label: "Imagen", type: "image" },
        ]}
        newItem={() => ({ id: uid(), title: "", category: "residencial" as const, items: "", imageUrl: "" })}
        itemLabel={p => p.title} itemThumb={p => p.imageUrl} />
    </div>
  );
}

// ─── Leads ────────────────────────────────────────────────────────────────────
function LeadBadge({ estado }: { estado: Lead["estado"] }) {
  const cfg = {
    nuevo: { bg: "rgba(0,242,255,.1)", color: C.cyan, label: "Nuevo" },
    en_proceso: { bg: "rgba(255,183,3,.1)", color: C.amber, label: "En Proceso" },
    cotizado: { bg: "rgba(16,185,129,.1)", color: C.green, label: "Cotizado" },
  }[estado] ?? { bg: "rgba(255,255,255,.05)", color: C.muted, label: estado };
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color, fontFamily: F.mono }}>{cfg.label}</span>;
}

function LeadsTab({ leads, setLeads, error }: { leads: Lead[] | null; setLeads: (fn: (l: Lead[]) => Lead[]) => void; error: string }) {
  const { token, handleError } = useAdmin();
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const cycle = async (l: Lead) => {
    const estado: Lead["estado"] = l.estado === "nuevo" ? "en_proceso" : l.estado === "en_proceso" ? "cotizado" : "nuevo";
    setLeads(ls => ls.map(x => (x.id === l.id ? { ...x, estado } : x)));
    try { await api.setLeadEstado(token, l.id, estado); } catch (e) {
      setActionError(handleError(e)); setLeads(ls => ls.map(x => (x.id === l.id ? l : x)));
    }
  };
  const remove = async (id: string) => {
    setConfirmDel(null);
    try { await api.deleteLead(token, id); setLeads(ls => ls.filter(x => x.id !== id)); } catch (e) { setActionError(handleError(e)); }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: F.head }}>Leads y Cotizaciones</h2>
        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(0,242,255,.08)", color: C.cyan, fontFamily: F.mono }}>{leads?.length ?? 0} registros</span>
      </div>
      {(error || actionError) && <p className="text-sm" style={{ color: C.red }}>{error || actionError}</p>}
      {leads === null ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: C.muted }}><Loader2 size={16} className="animate-spin" /> Cargando…</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#334155" }}>
          <FileText size={36} className="mx-auto mb-3" />
          <p className="text-sm" style={{ fontFamily: F.body }}>Aún no hay cotizaciones. Cuando alguien llene el formulario aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...leads].reverse().map(l => (
            <div key={l.id} className="p-5 rounded-2xl" style={{ background: "rgba(11,26,51,.6)", border: "1px solid rgba(0,242,255,.09)" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: C.text, fontFamily: F.head }}>{l.nombre}</span>
                    {l.empresa && <span className="text-xs" style={{ color: C.dim }}>· {l.empresa}</span>}
                    <LeadBadge estado={l.estado} />
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <a href={`tel:${l.telefono}`} className="text-xs flex items-center gap-1" style={{ color: C.cyan }}><Phone size={12} />{l.telefono}</a>
                    <a href={`mailto:${l.correo}`} className="text-xs flex items-center gap-1" style={{ color: C.muted }}><Mail size={12} />{l.correo}</a>
                  </div>
                  <div className="text-xs" style={{ color: "#64748b" }}>{l.servicio || "Sin servicio"} · {l.fecha}</div>
                  {l.mensaje && <p className="text-xs mt-1 whitespace-pre-line" style={{ color: C.muted }}>{l.mensaje}</p>}
                </div>
                <div className="flex gap-2">
                  <Btn onClick={() => cycle(l)}>Cambiar estado</Btn>
                  {confirmDel === l.id
                    ? <><Btn variant="danger" onClick={() => remove(l.id)}>¿Eliminar?</Btn><Btn onClick={() => setConfirmDel(null)}>No</Btn></>
                    : <Btn variant="danger" onClick={() => setConfirmDel(l.id)} title="Eliminar"><Trash2 size={14} /></Btn>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelTab({ leads, draft, goTo }: { leads: Lead[] | null; draft: SiteData; goTo: (t: Tab) => void }) {
  const ls = leads ?? [];
  const stats = [
    { label: "Total Leads", value: ls.length, icon: FileText, color: C.cyan, tab: "leads" as Tab },
    { label: "Leads Nuevos", value: ls.filter(l => l.estado === "nuevo").length, icon: Bell, color: C.amber, tab: "leads" as Tab },
    { label: "Fotos en galería", value: draft.galleryItems.length, icon: ImageIcon, color: C.green, tab: "proyectos" as Tab },
    { label: "Proyectos", value: draft.projects.length, icon: FolderOpen, color: "#8b5cf6", tab: "proyectos" as Tab },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: F.head }}>Panel de Control</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => goTo(s.tab)} className="p-5 rounded-2xl text-left transition-all hover:-translate-y-0.5" style={{ background: "rgba(11,26,51,.7)", border: "1px solid rgba(0,242,255,.1)" }}>
            <s.icon size={20} style={{ color: s.color, marginBottom: 10 }} />
            <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: F.mono }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#64748b", fontFamily: F.body }}>{s.label}</div>
          </button>
        ))}
      </div>
      <div className="p-5 rounded-2xl space-y-2 text-sm" style={{ ...cardStyle, color: C.muted, fontFamily: F.body }}>
        <SectionTitle>CÓMO EDITAR</SectionTitle>
        <p>1. Elige una sección en el menú (General, Inicio, Instalación…) y modifica textos, imágenes, videos, iconos o listas.</p>
        <p>2. Para imágenes y videos puedes pegar un link, subir un archivo desde tu equipo o elegir uno de la biblioteca.</p>
        <p>3. Pulsa <b style={{ color: C.amber }}>Publicar cambios</b> arriba para que todos los visitantes los vean.</p>
      </div>
    </div>
  );
}

// ─── Configuración ────────────────────────────────────────────────────────────
function SettingsTab({ setDraft }: { setDraft: SetDraft }) {
  const { token, handleError } = useAdmin();
  const [cur, setCur] = useState(""); const [p1, setP1] = useState(""); const [p2, setP2] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const legacy = useMemo(() => { try { return localStorage.getItem("luedmon_v2"); } catch { return null; } }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.length < 8) return setMsg("Mínimo 8 caracteres.");
    if (p1 !== p2) return setMsg("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      await api.changePassword(token, cur, p1);
      setMsg("✓ Contraseña actualizada correctamente."); setCur(""); setP1(""); setP2("");
    } catch (err) { setMsg(handleError(err)); } finally { setBusy(false); }
  };

  const importLegacy = () => {
    try {
      const old = JSON.parse(legacy ?? "{}");
      const c = old.content ?? {};
      setDraft(d => {
        const text = { ...d.text };
        for (const k of ["tagline", "phone1", "phone2", "email", "address", "heroSubHeadline", "heroBody", "slide2Headline", "slide3Headline", "slide3Body"] as const) {
          if (typeof c[k] === "string" && c[k]) text[k] = c[k];
        }
        const heroPhrases = c.heroHeadline ? [c.heroHeadline, ...d.heroPhrases.slice(1)] : d.heroPhrases;
        return { ...d, text, heroPhrases, projects: Array.isArray(old.projects) ? old.projects : d.projects };
      });
      setInfo("✓ Datos importados. Revísalos y pulsa «Publicar cambios».");
    } catch { setInfo("No se pudieron leer los datos guardados en este navegador."); }
  };

  const ok = msg.startsWith("✓");
  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: F.head }}>Configuración</h2>
      <form onSubmit={save} className="p-5 rounded-2xl space-y-3" style={cardStyle}>
        <SectionTitle>CAMBIAR CONTRASEÑA</SectionTitle>
        {msg && <div className="p-3 rounded-xl text-sm" style={{ background: ok ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)", color: ok ? "#6ee7b7" : C.red }}>{msg}</div>}
        <input type="password" className={inputCls} style={inputStyle} placeholder="Contraseña actual" value={cur} onChange={e => setCur(e.target.value)} required autoComplete="current-password" />
        <input type="password" className={inputCls} style={inputStyle} placeholder="Nueva contraseña" value={p1} onChange={e => setP1(e.target.value)} required autoComplete="new-password" />
        <input type="password" className={inputCls} style={inputStyle} placeholder="Confirmar contraseña" value={p2} onChange={e => setP2(e.target.value)} required autoComplete="new-password" />
        <Btn type="submit" variant="amber" disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />} Actualizar contraseña</Btn>
      </form>
      <div className="p-5 rounded-2xl space-y-3" style={cardStyle}>
        <SectionTitle>RESTAURAR</SectionTitle>
        {info && <p className="text-sm" style={{ color: info.startsWith("✓") ? "#6ee7b7" : C.red }}>{info}</p>}
        {legacy && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: C.muted }}>Este navegador tiene textos y proyectos editados con la versión anterior del panel (que solo se guardaba localmente).</p>
            <Btn onClick={importLegacy}><Upload size={14} /> Importar datos de este navegador</Btn>
          </div>
        )}
        <p className="text-xs" style={{ color: C.muted }}>Vuelve a cargar todo el contenido original del sitio en el editor (no se publica hasta que pulses «Publicar cambios»).</p>
        <Btn variant="danger" onClick={() => { setDraft(() => DEFAULT_SITE); setInfo("✓ Contenido original cargado en el editor."); }}><RotateCcw size={14} /> Restaurar contenido original</Btn>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess, onClose, logo }: { onSuccess: (token: string) => void; onClose: () => void; logo: React.ReactNode }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { onSuccess(await api.login(u.trim(), p)); }
    catch (e) { setErr(e instanceof Error ? e.message : "Error al ingresar."); }
    finally { setBusy(false); }
  };
  const iStyle = { ...inputStyle, background: "rgba(0,242,255,.05)", border: "1px solid rgba(0,242,255,.2)" };
  return (
    <div className="flex items-center justify-center h-full p-8">
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">{logo}</div>
          <h2 className="text-2xl font-bold" style={{ color: C.text, fontFamily: F.head }}>Acceso Sistema</h2>
          <p className="text-sm mt-1" style={{ color: C.dim, fontFamily: F.body }}>Panel de Administración LUEDMON</p>
        </div>
        {err && <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: C.red, fontFamily: F.body }}>{err}</div>}
        <input className="w-full px-4 py-3 rounded-xl outline-none text-sm" style={iStyle} placeholder="Usuario" value={u} onChange={e => setU(e.target.value)} required autoComplete="username" />
        <input type="password" className="w-full px-4 py-3 rounded-xl outline-none text-sm" style={iStyle} placeholder="Contraseña" value={p} onChange={e => setP(e.target.value)} required autoComplete="current-password" />
        <button type="submit" disabled={busy} className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: C.cyan, color: "#060f1e", fontFamily: F.head }}>
          {busy && <Loader2 size={15} className="animate-spin" />} Ingresar →
        </button>
        <button type="button" onClick={onClose} className="w-full text-sm py-2 transition-colors hover:text-slate-300" style={{ color: C.dim, fontFamily: F.body }}>Cancelar</button>
      </form>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
type Tab = "panel" | "leads" | "general" | "inicio" | "instalacion" | "mantenimiento" | "proyectos" | "contacto" | "medios" | "settings";
const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "panel", label: "Panel", icon: BarChart3 },
  { id: "leads", label: "Leads", icon: FileText },
  { id: "general", label: "General", icon: Globe },
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "instalacion", label: "Instalación", icon: Camera },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench },
  { id: "proyectos", label: "Proyectos y Galería", icon: ImageIcon },
  { id: "contacto", label: "Contacto", icon: Phone },
  { id: "medios", label: "Biblioteca", icon: FolderOpen },
  { id: "settings", label: "Configuración", icon: Settings },
];

export function AdminModal({ site, onPublished, onClose, logo }: {
  site: SiteData; onPublished: (s: SiteData) => void; onClose: () => void; logo: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(() => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } });
  const [draft, setDraftRaw] = useState<SiteData>(site);
  const [published, setPublished] = useState<SiteData>(site);
  const [tab, setTab] = useState<Tab>("panel");
  const [leads, setLeadsRaw] = useState<Lead[] | null>(null);
  const [leadsError, setLeadsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);

  const setDraft: SetDraft = useCallback(fn => setDraftRaw(d => fn(d)), []);
  const setLeads = useCallback((fn: (l: Lead[]) => Lead[]) => setLeadsRaw(l => fn(l ?? [])), []);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(published), [draft, published]);

  // Si el contenido del servidor llega después de abrir el panel, se usa como base (mientras no haya ediciones).
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (!dirtyRef.current) { setDraftRaw(site); setPublished(site); }
  }, [site]);

  const login = (t: string) => { setToken(t); try { sessionStorage.setItem(TOKEN_KEY, t); } catch {} };
  const logout = useCallback(() => { setToken(null); try { sessionStorage.removeItem(TOKEN_KEY); } catch {} }, []);

  const handleError = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) logout();
    return e instanceof Error ? e.message : "Error inesperado.";
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    setLeadsError("");
    api.listLeads(token).then(setLeadsRaw).catch(e => { setLeadsError(handleError(e)); setLeadsRaw([]); });
  }, [token, handleError]);

  const publish = async () => {
    if (!token) return;
    setSaving(true); setSaveMsg("");
    try {
      const clean = mergeSite(draft);
      await api.saveSite(token, clean);
      setPublished(clean); onPublished(clean);
      setSaveMsg("✓ Publicado"); setTimeout(() => setSaveMsg(""), 3000);
      return true;
    } catch (e) {
      setSaveMsg(handleError(e));
      return false;
    } finally { setSaving(false); }
  };

  const requestClose = () => (dirty && token ? setConfirmClose(true) : onClose());
  const newLeads = (leads ?? []).filter(l => l.estado === "nuevo").length;

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch" style={{ animation: "scaleIn .25s ease" }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)" }} onClick={!token ? onClose : undefined} />
      <div className="relative z-10 m-auto w-full flex flex-col" style={{
        maxWidth: token ? "1200px" : "480px", height: token ? "92vh" : "auto",
        background: "#060f1e", border: "1px solid rgba(0,242,255,.18)", borderRadius: "1.5rem", overflow: "hidden",
        boxShadow: "0 30px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(0,242,255,.05)",
      }}>
        {!token ? (
          <>
            <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(255,255,255,.05)", color: "#64748b" }}><X size={18} /></button>
            <AdminLogin onSuccess={login} onClose={onClose} logo={logo} />
          </>
        ) : (
          <Ctx.Provider value={{ token, handleError }}>
            {/* Barra superior */}
            <div className="flex items-center gap-3 px-5 py-3 flex-wrap" style={{ borderBottom: "1px solid rgba(0,242,255,.1)", background: "rgba(4,12,24,.95)" }}>
              <div className="text-xs font-bold tracking-widest" style={{ color: "white", fontFamily: F.head }}>LUEDMON <span style={{ color: C.cyan, fontFamily: F.mono }}>ADMIN</span></div>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                {saveMsg && <span className="text-xs" style={{ color: saveMsg.startsWith("✓") ? C.green : C.red, fontFamily: F.body }}>{saveMsg}</span>}
                {dirty && !saveMsg && <span className="text-xs flex items-center gap-1" style={{ color: C.amber, fontFamily: F.body }}><AlertTriangle size={12} /> Cambios sin publicar</span>}
                {dirty && <Btn onClick={() => setDraftRaw(published)}><RotateCcw size={14} /> Descartar</Btn>}
                <Btn variant="amber" onClick={publish} disabled={!dirty || saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publicar cambios
                </Btn>
                <IconBtn onClick={requestClose} title="Cerrar"><X size={16} /></IconBtn>
              </div>
            </div>
            {confirmClose && (
              <div className="flex items-center gap-3 px-5 py-3 flex-wrap" style={{ background: "rgba(255,183,3,.08)", borderBottom: "1px solid rgba(255,183,3,.25)" }}>
                <span className="text-sm" style={{ color: C.amber, fontFamily: F.body }}>Tienes cambios sin publicar.</span>
                <Btn variant="amber" onClick={async () => { if (await publish()) onClose(); }}>Publicar y salir</Btn>
                <Btn variant="danger" onClick={onClose}>Salir sin publicar</Btn>
                <Btn onClick={() => setConfirmClose(false)}>Seguir editando</Btn>
              </div>
            )}
            <div className="flex flex-1 min-h-0 flex-col md:flex-row">
              {/* Menú lateral */}
              <nav className="md:w-56 flex-shrink-0 flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-y-auto" style={{ background: "rgba(4,12,24,.95)", borderRight: "1px solid rgba(0,242,255,.08)" }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap"
                    style={{ background: tab === t.id ? "rgba(0,242,255,.1)" : "transparent", color: tab === t.id ? C.cyan : "#64748b", fontFamily: F.body }}>
                    <t.icon size={16} /> {t.label}
                    {t.id === "leads" && newLeads > 0 && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,183,3,.2)", color: C.amber, fontFamily: F.mono }}>{newLeads}</span>
                    )}
                  </button>
                ))}
                <button onClick={logout} className="md:mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:text-red-400 whitespace-nowrap" style={{ color: "#334155", fontFamily: F.body }}>
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </nav>
              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8" style={{ background: "rgba(6,15,30,.95)" }}>
                {tab === "panel" && <PanelTab leads={leads} draft={draft} goTo={setTab} />}
                {tab === "leads" && <LeadsTab leads={leads} setLeads={setLeads} error={leadsError} />}
                {tab === "general" && <GeneralTab draft={draft} setDraft={setDraft} />}
                {tab === "inicio" && <InicioTab draft={draft} setDraft={setDraft} />}
                {tab === "instalacion" && <InstalacionTab draft={draft} setDraft={setDraft} />}
                {tab === "mantenimiento" && <MantenimientoTab draft={draft} setDraft={setDraft} />}
                {tab === "proyectos" && <ProyectosTab draft={draft} setDraft={setDraft} />}
                {tab === "contacto" && <div className="space-y-5"><TextGroups groups={TEXT_GROUPS.contacto} draft={draft} setDraft={setDraft} /></div>}
                {tab === "medios" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: F.head }}>Biblioteca de medios</h2>
                    <MediaLibrary />
                  </div>
                )}
                {tab === "settings" && <SettingsTab setDraft={setDraft} />}
              </div>
            </div>
          </Ctx.Provider>
        )}
      </div>
    </div>
  );
}
