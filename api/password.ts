import { checkPassword, errorResponse, isAuthorized, json, setPassword } from "./_lib.js";

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) return json({ error: "Sesión expirada. Vuelve a ingresar." }, 401);
    const { current, next } = await req.json().catch(() => ({}));
    if (typeof current !== "string" || typeof next !== "string") return json({ error: "Datos incompletos." }, 400);
    if (next.length < 8) return json({ error: "Mínimo 8 caracteres." }, 400);
    if (!(await checkPassword(current))) return json({ error: "La contraseña actual no es correcta." }, 400);
    await setPassword(next);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
