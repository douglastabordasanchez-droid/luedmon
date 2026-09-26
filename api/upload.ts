import { list } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { errorResponse, isAuthorized, json, MEDIA_PREFIX, verifyToken } from "./_lib.js";

const ALLOWED = ["image/*", "video/mp4", "video/webm", "video/quicktime"];

// Genera el permiso para que el navegador suba el archivo directo a Vercel Blob.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!verifyToken(clientPayload)) throw new Error("Sesión expirada. Vuelve a ingresar.");
        if (!pathname.startsWith(MEDIA_PREFIX)) throw new Error("Ruta no permitida.");
        return { allowedContentTypes: ALLOWED, maximumSizeInBytes: 200 * 1024 * 1024, addRandomSuffix: true };
      },
    });
    return json(result);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error al subir" }, 400);
  }
}

// Biblioteca de archivos subidos.
export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) return json({ error: "Sesión expirada. Vuelve a ingresar." }, 401);
    const files: { url: string; pathname: string; size: number; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: MEDIA_PREFIX, cursor });
      files.push(...page.blobs.map(b => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    files.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
    return json({ files });
  } catch (err) {
    return errorResponse(err);
  }
}
