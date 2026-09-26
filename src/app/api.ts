// Cliente de las funciones del servidor (carpeta /api, desplegadas en Vercel).
import { upload } from "@vercel/blob/client";
import type { SiteData } from "./siteData";

export interface Lead {
  id: string; fecha: string; nombre: string; empresa: string;
  correo: string; telefono: string; servicio: string; mensaje: string;
  estado: "nuevo" | "en_proceso" | "cotizado";
}
export type LeadInput = Omit<Lead, "id" | "fecha" | "estado">;
export interface MediaFile { url: string; pathname: string; size: number; uploadedAt: string }

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      headers: {
        ...(rest.body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("No hay conexión con el servidor.", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || data === null) {
    throw new ApiError(data?.error || "El servidor no respondió correctamente. ¿Está configurado Vercel Blob?", res.status);
  }
  return data as T;
}

export const api = {
  getSite: () => request<{ data: Partial<SiteData> | null }>("/api/site").then(r => r.data),
  saveSite: (token: string, data: SiteData) => request("/api/site", { method: "PUT", token, body: JSON.stringify(data) }),

  login: (user: string, password: string) =>
    request<{ token: string }>("/api/login", { method: "POST", body: JSON.stringify({ user, password }) }).then(r => r.token),
  changePassword: (token: string, current: string, next: string) =>
    request("/api/password", { method: "POST", token, body: JSON.stringify({ current, next }) }),

  submitLead: (lead: LeadInput) => request("/api/leads", { method: "POST", body: JSON.stringify(lead) }),
  listLeads: (token: string) => request<{ leads: Lead[] }>("/api/leads", { token }).then(r => r.leads),
  setLeadEstado: (token: string, id: string, estado: Lead["estado"]) =>
    request("/api/leads", { method: "PATCH", token, body: JSON.stringify({ id, estado }) }),
  deleteLead: (token: string, id: string) => request(`/api/leads?id=${encodeURIComponent(id)}`, { method: "DELETE", token }),

  listMedia: (token: string) => request<{ files: MediaFile[] }>("/api/upload", { token }).then(r => r.files),
  uploadFile: async (token: string, file: File, onProgress?: (pct: number) => void) => {
    const clean = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
    const blob = await upload(`media/${clean}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: token,
      multipart: file.size > 8 * 1024 * 1024,
      onUploadProgress: e => onProgress?.(e.percentage),
    });
    return blob.url;
  },
};
