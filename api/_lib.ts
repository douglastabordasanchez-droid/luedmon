// Utilidades compartidas por las funciones del panel (los archivos con "_" no son rutas en Vercel).
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";

export const ADMIN_USER = process.env.ADMIN_USER || "Admin";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "Luedmon2026";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

export const SITE_PATH = "site/data.json";
export const CREDENTIALS_PREFIX = "auth/credentials";
export const LEADS_PREFIX = "leads/";
export const MEDIA_PREFIX = "media/";

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!s) throw new Error("Falta configurar BLOB_READ_WRITE_TOKEN en Vercel.");
  return s;
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export function errorResponse(err: unknown) {
  console.error(err);
  return json({ error: err instanceof Error ? err.message : "Error interno" }, 500);
}

// ── Tokens de sesión (HMAC firmado, sin estado) ──
export function signToken(user: string) {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | null | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function isAuthorized(req: Request) {
  const h = req.headers.get("authorization") || "";
  return verifyToken(h.startsWith("Bearer ") ? h.slice(7) : null);
}

// ── Contraseña (hash scrypt guardado en Blob con URL aleatoria) ──
interface StoredCredentials { salt: string; hash: string }

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

async function findCredentialBlobs() {
  const { blobs } = await list({ prefix: CREDENTIALS_PREFIX });
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
}

export async function checkPassword(password: string) {
  const [latest] = await findCredentialBlobs();
  if (!latest) return safeEqual(password, DEFAULT_PASSWORD);
  const creds = JSON.parse(await readBlobText(latest.url)) as StoredCredentials;
  return safeEqual(hashPassword(password, creds.salt), creds.hash);
}

export async function setPassword(password: string) {
  const old = await findCredentialBlobs();
  const salt = randomBytes(16).toString("hex");
  const creds: StoredCredentials = { salt, hash: hashPassword(password, salt) };
  await put(`${CREDENTIALS_PREFIX}.json`, JSON.stringify(creds), {
    access: "public", addRandomSuffix: true, contentType: "application/json",
  });
  if (old.length) await del(old.map(b => b.url));
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ── Lectura de blobs sin caché de CDN ──
export async function readBlobText(urlOrPathname: string) {
  const res = await get(urlOrPathname, { access: "public", useCache: false });
  if (!res || res.statusCode !== 200) throw new Error(`No se encontró ${urlOrPathname}`);
  return await new Response(res.stream).text();
}

export async function readJsonIfExists<T>(pathname: string): Promise<T | null> {
  const res = await get(pathname, { access: "public", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return JSON.parse(await new Response(res.stream).text()) as T;
}
