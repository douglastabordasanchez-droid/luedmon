SISTEMA DE DISEÑO Y TOKENS VISUALES (UI)
Paleta de Colores Base (Esencia Luedmon):

Fondo Primario Oscuro: #060f1e (Azul medianoche profundo/navy).

Fondo Secundario Oscuro: #0b1a33 (Para tarjetas y elementos con contraste sobre fondo oscuro).

Fondos Claros (Secciones Alternas): #ffffff y #f4f7fc (Blanco puro y un gris hielo azulado muy limpio).

Acento Primario (Iluminación Satelital): #00f2ff (Cian eléctrico/azul claro vibrante para bordes interactivos, iconos y CTAs secundarios).

Acento de Acción (Contraste Crítico): #ffb703 (Amarillo oro/ámbar para botones principales de conversión, alertas y badges operativos).

Tipografía de Alta Fidelidad:

Títulos e Impacto: Plus Jakarta Sans (Weights: 700, 800) – Moderno y corporativo.

Cuerpo de Texto y Datos: Inter (Weights: 400, 500) – Legibilidad máxima.

Tags Técnicos y Métricas: JetBrains Mono (Weight: 600) – Identidad de ingeniería.

Estilo de Bordes y Capas: Esquinas redondeadas unificadas a 16px. Efectos de Glassmorphic con backdrop-filter: blur(16px) y bordes sutiles de 1px con opacidad del 10% (rgba(0, 242, 255, 0.1)).

🚀 INSTRUCCIONES ESTRUCTURALES PASO A PASO PARA FIGMA
1. Header Inteligente y Dinámico (Navegación)
Composición: Contenedor flotante full-width con desenfoque de fondo.

Izquierda: Logotipo original de Luedmon escalado perfectamente a un alto de 45px junto al texto en formato texto: LUEDMON (Font: Plus Jakarta Sans, Bold, #ffffff).

Centro: Menú de navegación plano: Servicios, Instalación, Mantenimiento, Nosotros. Color blanco, con estado hover que cambia a Cian (#00f2ff).

Derecha: Botón secundario estilizado con número de contacto: 📞 +57 315 800 6089 al lado de un Badge con texto en JetBrains Mono: ● EN LÍNEA.

Comportamiento de Scroll: Al bajar, el fondo pasa de transparente a un azul navy traslúcido (#060f1e con 85% de opacidad), y añade una línea de separación inferior de 1px en cian difuminado.

2. El Hero Split-Screen con Slider Horizontal Autómata
División de Pantalla (Layout de 2 Columnas):

Columna Derecha (Fija - Tarjeta de Conversión): Tarjeta rígida de vidrio esmerilado (Glassmorphism) que contiene el formulario "Solicita tu propuesta". Campos con placeholders limpios: Nombre *, Empresa, Correo *, Teléfono *, Servicio de interés ▾, Cuéntanos tu proyecto... Botón de envío masivo en color Amarillo Oro (#ffb703) con el texto: SOLICITAR COTIZACIÓN GRATUITA →.

Columna Izquierda (El Slider Dinámico de Servicios): Diseña un carrusel que se desliza horizontalmente hacia la derecha de forma automatizada cada 6 segundos. Debe contener 3 estados o vistas claras:

Slide 1 (Identidad Corporativa): Macro-logotipo de Luedmon iluminado en el centro. Título principal: "Protección Inteligente para lo que más importa" en blanco y amarillo. Texto descriptivo abajo: "Instalamos, integramos y mantenemos sistemas de videovigilancia, biometría, control de acceso y alarmas para residencias, empresas y comunidades."


Slide 2 (Portafolio de Instalación Integrada): Título: "Sistemas y Montajes de Alta Ingeniería". Grid interior de micro-tarjetas con iconos en cian para: CCTV (Circuitos Cerrados), Automatización de Accesos, Alarmas Residenciales/Comerciales, y Cercas Eléctricas.

Slide 3 (Estrategia de Mantenimiento Preventivo/Correctivo): Título con acento amarillo: "Garantía de Continuidad Operativa 24/7". Texto destacado: "Evita fallas críticas duplicando la vida útil de tus equipos con revisiones técnicas semestrales obligatorias".

Indicadores del Slider (Paginación): En la parte inferior izquierda de la sección, coloca 3 líneas horizontales delgadas; la línea activa debe pintarse en cian brillante (#00f2ff) y ensancharse el doble que las inactivas.

3. El Cuerpo de la Landing (Secciones Alternas)
Sección 01: Sectores de Cobertura (Fondo Claro - #ffffff):

Título centrado: "Soluciones Diseñadas para Cada Entorno".

Diseña un Grid de 4 columnas con tarjetas de bordes suaves (16px). Cada una debe incluir un icono vectorial limpio en azul oscuro y la descripción: Propiedad Horizontal (Conjuntos y edificios), Sector Empresarial (Fábricas e industrias), Sector Comercial (Locales y almacenes), y Entidades Públicas/Privadas.

Sección 02: Mantenimiento e Impacto Operativo (Fondo Oscuro - #0b1a33):

Diseño en Zig-Zag.

Izquierda: Tarjetas estadísticas de alto impacto visual usando tipografía JetBrains Mono gigante: -45% en costos por daños de emergencia y 2X de extensión en la vida útil de los equipos.

Derecha: Bloque estructurado de "Checklist de Inspección Semestral". Pestañas interactivas para alternar el contenido visual: Puertas Vehiculares (Engrase, ruidos, voltajes), Puertas Peatonales (Brazos hidráulicos, imanes), y Sistemas de Cámaras (Limpieza de lentes, enfoque, estado de discos duros).

4. Componentes Globales Permanentes (Capas Flotantes)
Botón Flotante de WhatsApp Dinámico:

Ubicación: Esquina inferior derecha de la pantalla, fijo por encima de cualquier sección (z-index: 999).

Diseño: Icono circular oficial de WhatsApp con fondo verde vibrante (#25d366), pero envuelto en un sutil anillo de pulso animado en color cian para integrarlo a la estética tecnológica de la web.

Comportamiento interactivo: Al pasar el cursor (hover), se despliega automáticamente hacia la izquierda una pequeña etiqueta traslúcida que dice: "Soporte y Emergencias Técnicas 24/7".

Acceso Oculto al Administrador (Admin Gateway):

Ubicación: Integrado estéticamente en el Footer, de manera discreta pero accesible para el personal autorizado. Un enlace tipográfico fino en color gris con opacidad baja, situado al lado de los créditos de desarrollo.

Texto: 🔒 Acceso Sistema. Al hacer clic, abre un modal centrado o redirige a la pantalla de login del backend.

🖥️ INTERFAZ DEL PANEL DE ADMINISTRACIÓN (CMS AD-HOC)
Figma debe generar una vista de pantalla adicional (Dashboard) para el backend auto-editable desarrollado por Codec Studio.

Layout del Dashboard: Barra lateral de navegación (Sidebar) en color azul noche oscuro (#060f1e) y panel de contenido principal sobre fondo gris claro (#f4f7fc).

Módulos de la Barra Lateral:

📊 Panel de Control (Resumen)

📥 Leads y Cotizaciones (Base de datos de clientes)

⚙️ Gestionar Landing (Editor de contenidos)

Diseño de la Vista: "Leads y Cotizaciones":

Una tabla de datos (Data-Table) moderna y limpia. Columnas: Fecha/Hora, Nombre del Cliente, Empresa, Teléfono, Canal de Origen (Ej: Facebook Ads, Tráfico Orgánico Web), Estado (Nuevo, En Proceso, Cotizado).

En la parte superior, filtros rápidos por fecha y un botón destacado en cian: 📥 Exportar a Google Sheets.

Diseño de la Vista: "Gestionar Landing (Auto-editable)":

Formularios internos con campos de texto abiertos para que el administrador pueda editar la información institucional sin tocar código.

Cajas de texto dedicadas para actualizar: Dirección Física, Teléfonos de Contacto, Correos Electrónicos Corporativos, y Precios o textos de los portafolios.

🏢 FOOTER ESTRUCTURAL E INSTITUCIONAL
Fondo: Negro absoluto (#010409) con tipografía blanca y acentos en cian.

Columna 1 (Marca y Redes): Logotipo completo de LUEDMON. Abajo, iconos tipográficos limpios y minimalistas para redes sociales (Facebook e Instagram) que cambian a cian al pasar el cursor.

Columna 2 (Mapa del Sitio): Título en tipografía JetBrains Mono: // NAVEGACIÓN en color cian. Enlaces en vertical: Principal, Instalación, Mantenimiento, Nosotros, Contacto.

Columna 3 (Datos de Contacto Reales): Título: // UBICACIÓN Y CONTACTO. Texto exacto formateado en líneas independientes con iconos alineados a la izquierda:

📍 Carrera 80D No 8c - 31, Piso 3

📞 +57 315 800 6089

✉️ gerencia@luedmonseguridad.com

Barra de Créditos Inferior:

Izquierda: © 2026 LUEDMON SEGURIDAD SATELITAL. TODOS LOS DERECHOS RESERVADOS.

Derecha: Enlace de acceso al sistema 🔒 Acceso Sistema seguido del sello de firma: DEVELOPED BY CODEC STUDIO vinculado a [https://www.codecstudio.online/](https://www.codecstudio.online/).