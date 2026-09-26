// ─── Contenido editable del sitio ──────────────────────────────────────────────
// Todo lo que aparece aquí se puede modificar desde el panel de administración.
// Estos valores son los predeterminados: se usan hasta que el admin publique cambios.
import {
  Camera, Shield, Zap, Bell, Lock, Wrench, CheckCircle, Phone, Mail, MapPin,
  Building2, ShoppingBag, Factory, Home, Settings, Eye, Users, Radio,
  HardHat, Server, MonitorPlay, DoorClosed, MapPinned, Cctv, Fingerprint, Car,
  Flame, Wifi, KeyRound, Siren, Cpu, Cable, Warehouse, School, Hospital, Store,
  Building, Truck, Video, Smartphone, Headset, Clock, BadgeCheck, Award, ScanFace,
  Cog, Hammer, PlugZap, Router, Satellite,
} from "lucide-react";

export type Page = "home" | "instalacion" | "mantenimiento" | "proyectos" | "contacto";

export const ICONS = {
  Camera, Cctv, Video, Shield, Lock, KeyRound, Fingerprint, ScanFace, Bell, Siren,
  Zap, PlugZap, Wrench, Hammer, Settings, Cog, Eye, Users, Radio, Wifi, Router,
  Satellite, Server, Cpu, Cable, MonitorPlay, Smartphone, Headset, DoorClosed, Car,
  Truck, Flame, Building2, Building, Home, ShoppingBag, Store, Factory, Warehouse,
  School, Hospital, HardHat, MapPinned, MapPin, Phone, Mail, Clock, BadgeCheck,
  Award, CheckCircle,
};
export type IconName = keyof typeof ICONS;
export const iconFor = (name: string) => ICONS[name as IconName] ?? Shield;

export interface Project {
  id: string; title: string;
  category: "residencial" | "comercial" | "industrial";
  items: string; imageUrl: string;
}
export interface GalleryCategory { id: string; label: string; icon: string }
export interface GalleryItem { id: string; src: string; category: string; alt: string; size: "big" | "wide" | "normal" }
export interface GalleryVideo { id: string; src: string; label: string; desc: string }

export interface SiteData {
  text: Record<TextKey, string>;
  media: { logo: string; logoFooter: string; heroVideo: string };
  heroPhrases: string[];
  slide2Cards: { icon: string; label: string }[];
  slide3Stats: { value: string; label: string }[];
  sectors: { icon: string; title: string; desc: string }[];
  impactStats: { prefix: string; value: number; suffix: string; label: string }[];
  checklist: { label: string; items: string[] }[];
  serviceCards: { icon: string; title: string; desc: string; page: Page }[];
  installServices: { icon: string; title: string; tag: string; desc: string; objectives: string[]; imageUrl: string }[];
  mantCards: { type: string; icon: string; headline: string; body: string; stat: string; statLabel: string; imageUrl: string }[];
  mantCategories: { title: string; icon: string; items: string[] }[];
  galleryCategories: GalleryCategory[];
  galleryItems: GalleryItem[];
  galleryVideos: GalleryVideo[];
  projects: Project[];
  formServices: string[];
  footerServices: { label: string; page: Page }[];
  socials: { name: string; handle: string; href: string }[];
}

// ─── Textos ───────────────────────────────────────────────────────────────────
// [clave, etiqueta en el panel, valor predeterminado, ¿multilínea?]
type TextDef = readonly [string, string, string, boolean?];
export interface TextGroup { title: string; fields: readonly TextDef[] }

export const TEXT_GROUPS = {
  general: [
    { title: "Marca", fields: [
      ["brandName", "Nombre de la marca", "LUEDMON"],
      ["brandSubtitle", "Subtítulo bajo el logo", "Seguridad satelital"],
      ["tagline", "Eslogan", "Instalación y Tecnologías en Seguridad"],
      ["navStatus", "Etiqueta de estado (menú)", "● EN LÍNEA"],
    ] },
    { title: "Menú de navegación", fields: [
      ["nav_home", "Principal", "Principal"],
      ["nav_instalacion", "Instalación", "Instalación"],
      ["nav_mantenimiento", "Mantenimiento", "Mantenimiento"],
      ["nav_proyectos", "Proyectos", "Proyectos"],
      ["nav_contacto", "Contacto", "Sede Central"],
    ] },
    { title: "Datos de contacto", fields: [
      ["phone1", "Teléfono principal", "315-800-6089"],
      ["phone2", "Teléfono alterno", "311-218-1356"],
      ["email", "Correo electrónico", "luedmonsatelital@gmail.com"],
      ["address", "Dirección", "Carrera 80D No. 8C - 31, Piso 3"],
      ["country", "País / ciudad (después de la dirección)", "Colombia"],
    ] },
    { title: "WhatsApp", fields: [
      ["whatsappNumber", "Número con indicativo (solo dígitos)", "573158006089"],
      ["whatsappMessage", "Mensaje prellenado", "Hola LUEDMON, quiero solicitar una cotización para mi proyecto."],
      ["whatsappTooltip", "Texto al pasar el mouse", "Solicita tu cotización con LUEDMON"],
    ] },
    { title: "Formulario de cotización", fields: [
      ["formServicePlaceholder", "Texto del selector de servicio", "Servicio de interés ▾"],
      ["formMessagePlaceholder", "Texto del campo mensaje", "Cuéntanos tu proyecto..."],
      ["formSubmit", "Botón enviar", "Solicitar Cotización Gratuita →"],
      ["formSuccess", "Mensaje de éxito", "✓ ¡Solicitud enviada! Le contactamos pronto."],
    ] },
    { title: "Pie de página", fields: [
      ["footerDescription", "Descripción", "Soluciones integrales en seguridad tecnológica con personal calificado y equipos certificados.", true],
      ["footerNavTag", "Título columna navegación", "// NAVEGACIÓN"],
      ["footerServicesTag", "Título columna servicios", "// SERVICIOS"],
      ["footerContactTag", "Título columna contacto", "// CONTACTO"],
      ["footerCopyright", "Derechos de autor", "© 2026 LUEDMON — INSTALACIÓN Y TECNOLOGÍAS EN SEGURIDAD. TODOS LOS DERECHOS RESERVADOS."],
    ] },
  ],
  inicio: [
    { title: "Hero – Slide 1", fields: [
      ["heroSubHeadline", "Subtítulo", "para lo que más importa"],
      ["heroBody", "Descripción", "Instalamos sistemas de videovigilancia CCTV, biometría, talanqueras, control de acceso y alarmas para residencias, empresas y comunidades en Colombia.", true],
      ["heroCallBtn", "Botón llamar", "Llamar ahora"],
      ["heroQuoteBtn", "Botón cotizar", "Cotizar gratis"],
    ] },
    { title: "Hero – Slide 2", fields: [
      ["slide2Tag", "Etiqueta", "// INSTALACIÓN INTEGRADA"],
      ["slide2Headline", "Título", "Sistemas y Montajes de Alta Ingeniería"],
      ["slide2Btn", "Botón", "Ver todos los servicios →"],
    ] },
    { title: "Hero – Slide 3", fields: [
      ["slide3Tag", "Etiqueta", "// MANTENIMIENTO 24/7"],
      ["slide3Headline", "Título (las 3 primeras palabras en blanco, el resto en amarillo)", "Garantía de Continuidad Operativa 24/7"],
      ["slide3Body", "Descripción", "Evita fallas críticas duplicando la vida útil de tus equipos con revisiones técnicas semestrales certificadas.", true],
    ] },
    { title: "Hero – Formulario lateral", fields: [
      ["heroFormTitle", "Título", "Solicita tu propuesta"],
      ["heroFormSubtitle", "Subtítulo", "Sin costo. Respondemos en menos de 2h."],
    ] },
    { title: "Sección sectores", fields: [
      ["sectorsTag", "Etiqueta", "// COBERTURA"],
      ["sectorsTitle", "Título", "Soluciones para Cada Entorno"],
      ["sectorsSubtitle", "Subtítulo", "Más de una década protegiendo hogares, negocios e industrias en Colombia.", true],
    ] },
    { title: "Sección impacto / checklist", fields: [
      ["statsTag", "Etiqueta", "// IMPACTO OPERATIVO"],
      ["statsTitle", "Título (Enter = salto de línea)", "Mantenimiento que\nprotege su inversión", true],
      ["statsBody", "Descripción", "Realizamos revisiones preventivas dos veces al año para extender la vida útil de sus equipos. Nuestros técnicos certificados responden fallas críticas en menos de 24 horas.", true],
      ["checklistTitle", "Título del checklist", "Checklist de Inspección Semestral"],
    ] },
    { title: "Sección servicios", fields: [
      ["servicesTag", "Etiqueta", "// SERVICIOS"],
      ["servicesTitle", "Título", "Portafolio Completo"],
      ["servicesLink", "Enlace a cotización", "Solicitar cotización"],
      ["servicesCardLink", "Enlace de cada tarjeta", "Ver detalle"],
    ] },
    { title: "Banner de contacto (se repite en varias páginas)", fields: [
      ["ctaTag", "Etiqueta", "// CONTÁCTENOS"],
      ["ctaTitle", "Título (Enter = salto de línea)", "¿Listo para blindar\nlo que más importa?", true],
      ["ctaBody", "Descripción", "Ingenieros certificados disponibles para visitar su propiedad y diseñar la solución de seguridad perfecta.", true],
      ["ctaButton", "Botón", "Solicitar cotización →"],
    ] },
  ],
  instalacion: [
    { title: "Encabezado de la página", fields: [
      ["instTag", "Etiqueta", "// INSTALACIÓN"],
      ["instTitle", "Título", "Sistemas de Instalación Integrada"],
      ["instSubtitle", "Subtítulo", "Instalamos tecnología de punta para supervisar, controlar y proteger su hogar, empresa o comunidad.", true],
      ["instBenefitsLabel", "Título de la lista de beneficios", "Beneficios clave:"],
    ] },
  ],
  mantenimiento: [
    { title: "Encabezado de la página", fields: [
      ["mantTag", "Etiqueta", "// MANTENIMIENTO"],
      ["mantTitle", "Título", "Servicio Técnico Especializado"],
      ["mantSubtitle", "Subtítulo", "Mantenimientos preventivos y correctivos para extender la vida útil de todos sus equipos de seguridad.", true],
    ] },
    { title: "Protocolo por equipo", fields: [
      ["mantProtocolTitle", "Título", "Protocolo por Equipo"],
      ["mantProtocolSubtitle", "Subtítulo", "Seleccione el sistema para ver el protocolo de inspección completo."],
      ["mantProtocolPrefix", "Prefijo del título de cada protocolo", "Mantenimiento:"],
    ] },
  ],
  proyectos: [
    { title: "Encabezado de la página", fields: [
      ["projTag", "Etiqueta", "// PROYECTOS"],
      ["projTitle", "Título", "Casos de Éxito"],
      ["projSubtitle", "Subtítulo", "Proyectos de instalación y mantenimiento en los sectores residencial, comercial e industrial de Colombia.", true],
    ] },
    { title: "Galería", fields: [
      ["galleryTag", "Etiqueta", "// GALERÍA"],
      ["galleryTitle", "Título", "Trabajo en Terreno — Bogotá"],
      ["gallerySubtitle", "Subtítulo", "Registro fotográfico de nuestras instalaciones: alturas, redes, monitoreo, control de acceso y cobertura en Bogotá.", true],
      ["galleryAllLabel", "Filtro 'todos'", "Todos"],
      ["videosTag", "Etiqueta de videos", "// CASOS EN VIDEO"],
      ["videosTitle", "Título de videos", "Véalo en Acción"],
    ] },
    { title: "Portafolio por sector", fields: [
      ["portfolioTag", "Etiqueta", "// PORTAFOLIO"],
      ["portfolioTitle", "Título", "Proyectos por Sector"],
      ["portfolioEmpty", "Mensaje sin proyectos", "No hay proyectos en esta categoría todavía."],
      ["cat_residencial", "Nombre categoría residencial", "Residencial"],
      ["cat_comercial", "Nombre categoría comercial", "Comercial"],
      ["cat_industrial", "Nombre categoría industrial", "Industrial"],
    ] },
  ],
  contacto: [
    { title: "Encabezado de la página", fields: [
      ["contactTag", "Etiqueta", "// SEDE CENTRAL"],
      ["contactTitle", "Título", "Contáctenos"],
      ["contactSubtitle", "Subtítulo", "Ingenieros certificados disponibles para visitar su propiedad y diseñar la solución perfecta.", true],
    ] },
    { title: "Información de contacto", fields: [
      ["contactInfoTitle", "Título", "Información de Contacto"],
      ["contactLabelPhone1", "Etiqueta teléfono principal", "Línea Principal"],
      ["contactLabelPhone2", "Etiqueta teléfono alterno", "Línea Alterna"],
      ["contactLabelEmail", "Etiqueta correo", "Correo Electrónico"],
      ["contactLabelAddress", "Etiqueta dirección", "Dirección"],
      ["socialTag", "Título redes sociales", "// REDES SOCIALES"],
    ] },
    { title: "Formulario", fields: [
      ["contactFormTitle", "Título", "Solicitar Cotización"],
      ["contactFormSubtitle", "Subtítulo", "Cuéntenos su proyecto. Respondemos en menos de 2 horas hábiles.", true],
    ] },
  ],
} as const satisfies Record<string, readonly TextGroup[]>;

type AllGroups = (typeof TEXT_GROUPS)[keyof typeof TEXT_GROUPS][number];
export type TextKey = AllGroups["fields"][number][0];

const DEFAULT_TEXT = Object.fromEntries(
  Object.values(TEXT_GROUPS).flatMap(groups => groups.flatMap(g => g.fields.map(f => [f[0], f[2]]))),
) as Record<TextKey, string>;

// ─── Valores predeterminados ──────────────────────────────────────────────────
export const DEFAULT_SITE: SiteData = {
  text: DEFAULT_TEXT,
  media: { logo: "/logo.png", logoFooter: "/logo-removebg-preview.png", heroVideo: "/camaras.mp4" },
  heroPhrases: ["Protección Inteligente", "Sistemas y Montajes", "Vigilancia Avanzada"],
  slide2Cards: [
    { icon: "Camera", label: "Cámaras CCTV" },
    { icon: "Lock", label: "Biometría y Acceso" },
    { icon: "Bell", label: "Alarmas Inteligentes" },
    { icon: "Zap", label: "Cerca Eléctrica" },
  ],
  slide3Stats: [
    { value: "-45%", label: "Costos emergencia" },
    { value: "2X", label: "Vida útil equipos" },
    { value: "24/7", label: "Soporte activo" },
  ],
  sectors: [
    { icon: "Building2", title: "Propiedad Horizontal", desc: "Conjuntos, edificios y urbanizaciones con soluciones perimetrales de seguridad completas." },
    { icon: "Factory", title: "Sector Industrial", desc: "Bodegas y fábricas con CCTV HD, biometría de alta seguridad y cercas eléctricas." },
    { icon: "ShoppingBag", title: "Sector Comercial", desc: "Locales y centros comerciales protegidos con alarmas conectadas a app móvil." },
    { icon: "Home", title: "Entidades y Comunidades", desc: "Colegios, oficinas y barrios con alarmas comunitarias y videoporteros integrados." },
  ],
  impactStats: [
    { prefix: "-", value: 45, suffix: "%", label: "en costos por daños de emergencia" },
    { prefix: "", value: 2, suffix: "X", label: "extensión vida útil de equipos" },
  ],
  checklist: [
    { label: "Puertas Vehiculares", items: ["Verificación de ruidos, engrase y velocidad de pluma", "Comprobación de partes mecánicas", "Verificar fotoceldas y bandas anti-aplastamiento", "Control de voltajes y consumos eléctricos"] },
    { label: "Puertas Peatonales", items: ["Limpieza general del equipo y accesorios", "Calibración del recorrido de apertura y cierre", "Nivelación de hoja y accesorios mecánicos", "Comprobación y limpieza de lectores de acceso"] },
    { label: "Cámaras CCTV", items: ["Verificación y ajuste de posicionamiento", "Revisión de lente, enfoque e iris automático", "Limpieza interior y exterior del dispositivo", "Comprobación de grabación y software"] },
  ],
  serviceCards: [
    { icon: "Camera", title: "Sistemas CCTV", desc: "Videovigilancia HD con grabación continua, visión nocturna y monitoreo remoto 24/7.", page: "instalacion" },
    { icon: "Lock", title: "Control de Acceso", desc: "Biometría, talanqueras, lectoras de proximidad y torniquetes para peatones y vehículos.", page: "instalacion" },
    { icon: "Bell", title: "Alarmas Inteligentes", desc: "Detección de intrusión con sensores de movimiento, contactos magnéticos y app móvil.", page: "instalacion" },
    { icon: "Zap", title: "Cerca Eléctrica", desc: "Barreras perimetrales de alta tensión que disuaden y alertan ante cualquier intento de acceso.", page: "instalacion" },
    { icon: "Wrench", title: "Mantenimiento Preventivo", desc: "Rutinas semestrales certificadas para mantener todos sus equipos al 100% de rendimiento.", page: "mantenimiento" },
    { icon: "Settings", title: "Mantenimiento Correctivo", desc: "Diagnóstico y reparación inmediata de fallas críticas con garantía en el servicio.", page: "mantenimiento" },
  ],
  installServices: [
    { icon: "Camera", title: "CCTV – Circuito Cerrado de Televisión", tag: "CCTV", desc: "Sistemas de videovigilancia que supervisar, controlan y aseguran su propiedad las 24 horas. Grabación continua con acceso remoto desde cualquier dispositivo.", objectives: ["Registro exacto de todo evento o suceso", "Visualización remota desde celular o computador", "Pruebas claras utilizables como evidencia legal", "Prevención de robos y actos delincuenciales", "Supervisión permanente sin importar el horario"], imageUrl: "/imagen 8.png" },
    { icon: "Lock", title: "Control de Acceso y Biometría", tag: "ACCESO", desc: "Sistemas biométricos, talanqueras vehiculares y torniquetes peatonales para controlar el ingreso de personas y vehículos a su propiedad.", objectives: ["Identificación por huella dactilar, facial o tarjeta", "Control total del ingreso peatonal y vehicular", "Registro histórico de entradas y salidas", "Neutralización inmediata de accesos no autorizados", "Integración con cámaras y alarmas existentes"], imageUrl: "/imagen 3.png" },
    { icon: "Eye", title: "Automatización de Puertas", tag: "PUERTAS", desc: "Puertas vehiculares y peatonales automatizadas con sensores de movimiento para un control fluido, seguro y eficiente del acceso.", objectives: ["Apertura suave y controlada sin contacto manual", "Neutraliza ingreso de amenazas externas", "Reducción de accidentes en zonas de tráfico vehicular", "Integración con control de acceso biométrico", "Mayor comodidad y eficiencia operativa"], imageUrl: "/imagen 15.png" },
    { icon: "Bell", title: "Alarmas Residenciales y Comerciales", tag: "ALARMAS", desc: "Sistemas de detección con sensores de movimiento y cierres magnéticos que disparan sirenas y alertas inmediatas al celular mediante app móvil.", objectives: ["Aviso inmediato ante presencia de intrusos", "Detección de eventos atípicos en tiempo real", "Notificaciones a celulares programados vía app", "Disuasión efectiva de actos delictivos"], imageUrl: "/imagen 16.png" },
    { icon: "Radio", title: "Alarmas Comunitarias", tag: "COMUNIDAD", desc: "Red de alarmas interconectadas que protegen comunidades enteras. Se activan vía app móvil y advierten a todos los vecinos sobre emergencias en el área.", objectives: ["Reducción de la delincuencia en barrios", "Activación remota desde app móvil individual", "Alertas de emergencia en toda el área de cobertura", "Fomento de la seguridad colaborativa vecinal"], imageUrl: "/imagen 12.png" },
    { icon: "Zap", title: "Cercas Eléctricas", tag: "PERÍMETRO", desc: "Barreras físicas de alta tensión instaladas en el perímetro de su propiedad. Disuaden intrusos al instante y activan alarmas ante cualquier contacto.", objectives: ["Protección continua del perímetro los 365 días", "Detección inmediata de intento de penetración", "Disuasión psicológica efectiva para intrusos", "Calibración precisa de voltaje de seguridad"], imageUrl: "/imagen 11.png" },
  ],
  mantCards: [
    { type: "PREVENTIVO", icon: "Shield", headline: "Mantenimientos Preventivos", body: "Realizados dos veces al año para extender la vida útil de sus equipos y prevenir fallas costosas.", stat: "2X", statLabel: "vida útil de equipos", imageUrl: "/imagen 13.jpg" },
    { type: "CORRECTIVO", icon: "Wrench", headline: "Mantenimientos Correctivos", body: "Diagnóstico y reparación inmediata de fallas en equipos que han dejado de funcionar.", stat: "-45%", statLabel: "costos de emergencia", imageUrl: "/imagen 17.png" },
  ],
  mantCategories: [
    { title: "Cámaras", icon: "Camera", items: ["Verificación y ajuste de posicionamiento", "Revisión de lente, enfoque e iris automático", "Comprobación con controlador/software", "Limpieza interior y exterior", "Cambio de accesorios para mejoramiento"] },
    { title: "Control de Acceso", icon: "Lock", items: ["Comprobación de parámetros de controladoras", "Verificación de registros de acceso", "Engrase de elementos mecánicos", "Limpieza de lectores biométricos", "Revisión de cableado y alimentaciones"] },
    { title: "Puertas Vehiculares", icon: "Eye", items: ["Verificación de ruidos, engrase y pluma", "Comprobación de partes mecánicas", "Verificar fotoceldas y bandas de seguridad", "Chequeo de instalación eléctrica", "Control de voltajes y consumos"] },
    { title: "Puertas Peatonales", icon: "Users", items: ["Limpieza general del equipo", "Calibración de apertura y cierre", "Nivelación de hoja y accesorios mecánicos", "Comprobación de lectores de acceso", "Detección de anomalías en tornos"] },
    { title: "Alarmas", icon: "Bell", items: ["Revisión de sensores infrarrojos", "Mantenimiento de cierres magnéticos", "Revisión y mantenimiento de sirenas", "Central y discador de comunicación", "Revisión de batería y cableado"] },
    { title: "Cerca Eléctrica", icon: "Zap", items: ["Revisión y mantenimiento de la central", "Calibración de voltaje del sistema", "Revisión de postes y alambrado", "Ajuste de tensiómetro a las cuerdas", "Aislante de alambres perimetrales"] },
  ],
  galleryCategories: [
    { id: "alturas", label: "Alturas & Fachadas", icon: "HardHat" },
    { id: "redes", label: "Redes & CCTV", icon: "Server" },
    { id: "control", label: "Centro de Monitoreo", icon: "MonitorPlay" },
    { id: "acceso", label: "Control de Acceso", icon: "DoorClosed" },
    { id: "cobertura", label: "Cobertura Bogotá", icon: "MapPinned" },
  ],
  galleryItems: [
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
  ],
  galleryVideos: [
    { id: "v1", src: "/VID-20240921-WA0005.mp4", label: "Instalación en sitio", desc: "Caso de éxito en video" },
    { id: "v2", src: "/WhatsApp Video 2026-01-10 at 8.55.30 AM.mp4", label: "Puesta en marcha", desc: "Sistema de seguridad operativo" },
  ],
  projects: [
    { id: "1", title: "Conjunto Residencial El Pinar", category: "residencial", items: "CCTV · Control de Acceso · Alarma", imageUrl: "/imagen 1.png" },
    { id: "2", title: "Edificio Empresarial Centro Mayor", category: "comercial", items: "CCTV · Cerca Eléctrica · Alarma", imageUrl: "/imagen 10.png" },
    { id: "3", title: "Planta Industrial Zona Franca", category: "industrial", items: "CCTV HD · Control de Acceso · Cerca Eléctrica", imageUrl: "/imagen 7.png" },
    { id: "4", title: "Urbanización Villa del Sol", category: "residencial", items: "CCTV · Alarma Comunitaria · Videoportero", imageUrl: "/imagen 3.png" },
    { id: "5", title: "Centro Comercial Multiplaza", category: "comercial", items: "CCTV · Control Vehicular · Alarmas", imageUrl: "/imagen 17.png" },
    { id: "6", title: "Bodega Logística Norte", category: "industrial", items: "CCTV Exterior · Cerca Eléctrica · Control de Acceso", imageUrl: "/imagen 14.png" },
  ],
  formServices: ["Sistemas CCTV", "Control de Acceso / Biometría", "Alarmas Residenciales", "Alarmas Comunitarias", "Talanqueras / Puertas Automatizadas", "Cerca Eléctrica", "Videoportero", "Mantenimiento Preventivo", "Mantenimiento Correctivo"],
  footerServices: [
    { label: "Sistemas CCTV", page: "instalacion" },
    { label: "Control de Acceso", page: "instalacion" },
    { label: "Alarmas", page: "instalacion" },
    { label: "Cerca Eléctrica", page: "instalacion" },
    { label: "Mantenimiento", page: "mantenimiento" },
  ],
  socials: [
    { name: "Instagram", handle: "@Luedmon.Seguridad", href: "https://www.instagram.com/luedmon.seguridad/" },
    { name: "Facebook", handle: "@Luedmon.Seguridad", href: "https://www.facebook.com/Luedmon.seguridad/" },
  ],
};

// Imágenes y videos incluidos en el sitio (carpeta public/), para elegir desde la biblioteca.
export const BUILTIN_MEDIA = [
  "/logo.png", "/logo-removebg-preview.png", "/preview.png",
  ...[1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17].map(n => `/imagen ${n}.png`), "/imagen 13.jpg",
  "/camaras.mp4", "/VID-20240921-WA0005.mp4", "/WhatsApp Video 2026-01-10 at 8.55.30 AM.mp4",
];

// Combina lo guardado con los valores predeterminados (para campos nuevos que aún no existan).
export function mergeSite(saved: Partial<SiteData> | null | undefined): SiteData {
  if (!saved || typeof saved !== "object") return DEFAULT_SITE;
  const merged = { ...DEFAULT_SITE } as SiteData;
  for (const key of Object.keys(DEFAULT_SITE) as (keyof SiteData)[]) {
    const v = saved[key];
    if (v === undefined || v === null) continue;
    if (key === "text" || key === "media") {
      (merged as any)[key] = { ...DEFAULT_SITE[key], ...(v as object) };
    } else if (Array.isArray(v) === Array.isArray(DEFAULT_SITE[key])) {
      (merged as any)[key] = v;
    }
  }
  return merged;
}

export const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);
export const mediaSrc = (src: string) => (src.startsWith("/") ? encodeURI(src) : src);
