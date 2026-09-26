import { put } from "@vercel/blob";
import { errorResponse, isAuthorized, json, readJsonIfExists, SITE_PATH } from "./_lib.js";

// Contenido público del sitio: lo lee cualquier visitante, solo el admin lo modifica.
export async function GET() {
  try {
    const data = await readJsonIfExists<unknown>(SITE_PATH);
    return json({ data });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: Request) {
  try {
    if (!isAuthorized(req)) return json({ error: "Sesión expirada. Vuelve a ingresar." }, 401);
    const data = await req.json().catch(() => null);
    if (!data || typeof data !== "object") return json({ error: "Contenido inválido." }, 400);
    await put(SITE_PATH, JSON.stringify(data), {
      access: "public", addRandomSuffix: false, allowOverwrite: true,
      contentType: "application/json", cacheControlMaxAge: 60,
    });
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
