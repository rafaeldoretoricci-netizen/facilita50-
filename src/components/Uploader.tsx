"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Envia o arquivo direto do navegador para o Supabase Storage (sem limite de tamanho do servidor)
 * e guarda o caminho num campo escondido do formulário.
 */
export default function Uploader({ bucket, name, label, accept, hint }: { bucket: "capas" | "ebooks" | "conteudos"; name: string; label: string; accept: string; hint?: string }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<string>("");
  const id = `up-${name}`;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("Enviando...");
    const clean = file.name.normalize("NFD").replace(/[^\w.-]+/g, "-").toLowerCase();
    const path = `${Date.now()}-${clean}`;
    const { error } = await supabaseBrowser().storage.from(bucket).upload(path, file, { upsert: false });
    if (error) {
      setStatus("Não foi possível enviar. Tente de novo.");
      return;
    }
    if (bucket === "capas") {
      const { data } = supabaseBrowser().storage.from(bucket).getPublicUrl(path);
      setValue(data.publicUrl);
    } else {
      setValue(path);
    }
    setStatus(`Enviado: ${file.name}`);
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="file" accept={accept} onChange={onChange} />
      <input type="hidden" name={name} value={value} />
      <span className="hint" role="status">{status || hint}</span>
    </div>
  );
}
