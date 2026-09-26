import { del, list, put } from "@vercel/blob";
import { errorResponse, isAuthorized, json, LEADS_PREFIX, readBlobText } from "./_lib.js";

const FIELDS = ["nombre", "empresa", "correo", "telefono", "servicio", "mensaje"] as const;
const ESTADOS = ["nuevo", "en_proceso", "cotizado"];

// Cada cotización es un archivo con URL aleatoria; solo el admin puede listarlas.
async function findLead(id: string) {
  const { blobs } = await list({ prefix: `${LEADS_PREFIX}${id}` });
  return blobs[0];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const lead: Record<string, string> = {};
    for (const f of FIELDS) lead[f] = typeof body[f] === "string" ? body[f].slice(0, 4000) : "";
    if (!lead.nombre || !lead.correo || !lead.telefono) return json({ error: "Faltan datos obligatorios." }, 400);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id, ...lead, estado: "nuevo",
      fecha: new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" }),
    };
    await put(`${LEADS_PREFIX}${id}.json`, JSON.stringify(record), { access: "public", addRandomSuffix: true, contentType: "application/json" });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) return json({ error: "Sesión expirada. Vuelve a ingresar." }, 401);
    const blobs = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: LEADS_PREFIX, cursor });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    const leads = await Promise.all(blobs.map(async b => JSON.parse(await readBlobText(b.url))));
    leads.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return json({ leads });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!isAuthorized(req)) return json({ error: "Sesión expirada. Vuelve a ingresar." }, 401);
    const { id, estado } = await req.json().catch(() => ({}));
    if (typeof id !== "string" || !ESTADOS.includes(estado)) return json({ error: "Datos inválidos." }, 400);
    const blob = await findLead(id);
    if (!blob) return json({ error: "No encontrado." }, 404);
    const record = { ...JSON.parse(await readBlobText(blob.url)), estado };
    await put(blob.pathname, JSON.stringify(record), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) return json({ error: "Sesión expirada. Vuelve a ingresar." }, 401);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Falta el id." }, 400);
    const blob = await findLead(id);
    if (blob) await del(blob.url);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
