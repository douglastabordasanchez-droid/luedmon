import { ADMIN_USER, checkPassword, errorResponse, json, signToken } from "./_lib.js";

export async function POST(req: Request) {
  try {
    const { user, password } = await req.json().catch(() => ({}));
    if (typeof user !== "string" || typeof password !== "string") return json({ error: "Datos incompletos." }, 400);
    if (user !== ADMIN_USER || !(await checkPassword(password))) return json({ error: "Credenciales incorrectas." }, 401);
    return json({ token: signToken(user) });
  } catch (err) {
    return errorResponse(err);
  }
}
