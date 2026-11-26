import BookCover from "@/components/BookCover";
import Uploader from "@/components/Uploader";
import { getBooks, getSettings } from "@/lib/data";
import { brl } from "@/lib/format";
import { deleteBook, moveBook, saveBook, saveSettings, setLaunch, toggleShowcase } from "../actions";
import type { Book } from "@/lib/types";

export const metadata = { title: "Vitrine" };

function BookForm({ book }: { book?: Book }) {
  const p = book;
  return (
    <form action={saveBook} className="admin-form">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="row2">
        <div className="field"><label htmlFor={`t-${p?.id ?? "novo"}`}>Título</label><input id={`t-${p?.id ?? "novo"}`} name="title" required defaultValue={p?.title} /></div>
        <div className="field"><label htmlFor={`s-${p?.id ?? "novo"}`}>Subtítulo ou volume</label><input id={`s-${p?.id ?? "novo"}`} name="subtitle" defaultValue={p?.subtitle ?? ""} /></div>
      </div>
      <div className="field"><label htmlFor={`y-${p?.id ?? "novo"}`}>Sinopse</label><textarea id={`y-${p?.id ?? "novo"}`} name="synopsis" defaultValue={p?.synopsis ?? ""} /></div>
      <div className="row2">
        <div className="field"><label htmlFor={`pf-${p?.id ?? "novo"}`}>Preço impresso (R$)</label><input id={`pf-${p?.id ?? "novo"}`} name="price_physical" inputMode="decimal" defaultValue={p?.price_physical?.toString().replace(".", ",") ?? ""} /></div>
        <div className="field"><label htmlFor={`pd-${p?.id ?? "novo"}`}>Preço digital (R$)</label><input id={`pd-${p?.id ?? "novo"}`} name="price_digital" inputMode="decimal" defaultValue={p?.price_digital?.toString().replace(".", ",") ?? ""} /></div>
      </div>
      <label className="check"><input type="checkbox" name="has_physical" defaultChecked={p?.has_physical ?? true} /> Vender impresso</label>
      <label className="check"><input type="checkbox" name="has_digital" defaultChecked={p?.has_digital ?? true} /> Vender digital</label>
      <div className="row2">
        <Uploader bucket="capas" name="cover_url" label="Capa (imagem)" accept="image/*" hint={p?.cover_url ? "Já tem capa. Envie outra só se quiser trocar." : "JPG ou PNG, em pé (formato de livro)."} />
        <Uploader bucket="ebooks" name="ebook_path" label="Arquivo do livro digital" accept=".pdf,.epub" hint={p?.ebook_path ? "Arquivo já enviado. Envie outro só se quiser trocar." : "PDF ou EPUB. Fica protegido: só quem comprou ou é membro baixa."} />
      </div>
      <button className="btn btn-main" style={{ justifySelf: "start" }}>{p ? "Salvar alterações" : "Adicionar livro"}</button>
    </form>
  );
}

export default async function Vitrine() {
  const [books, settings] = await Promise.all([getBooks(), getSettings()]);
  return (
    <div style={{ display: "grid", gap: "1.4rem" }}>
      <form action={saveSettings} className="card">
        <label className="switch" htmlFor="only_launch">
          <input type="checkbox" id="only_launch" name="only_launch" defaultChecked={settings.only_launch} />
          <span><b>Mostrar só o livro de lançamento na página inicial</b><br /><span style={{ fontSize: ".9rem" }}>Desmarcado: a vitrine com os outros livros aparece logo abaixo do lançamento.</span></span>
        </label>
        <div className="row2">
          <div className="field"><label htmlFor="community_price">Mensalidade da Comunidade (R$)</label><input id="community_price" name="community_price" inputMode="decimal" defaultValue={String(settings.community_price).replace(".", ",")} /><span className="hint">Vale para novas assinaturas.</span></div>
          <div className="field"><label htmlFor="shipping_flat">Frete dos livros impressos (R$)</label><input id="shipping_flat" name="shipping_flat" inputMode="decimal" defaultValue={String(settings.shipping_flat).replace(".", ",")} /><span className="hint">Valor fixo por pedido.</span></div>
        </div>
        <button className="btn btn-main">Salvar configurações</button>
      </form>

      <div className="vit-list">
        {books.map((b, i) => {
          const isLaunch = settings.launch_book_id === b.id;
          return (
            <div className="vit" key={b.id} style={{ alignItems: "start" }}>
              <div className="mini"><BookCover book={b} className="c" /></div>
              <div style={{ minWidth: 0 }}>
                <b>{b.title}</b> {b.subtitle && <span style={{ color: "var(--muted)" }}>· {b.subtitle}</span>}<br />
                <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                  {b.has_physical ? `Impresso ${brl(b.price_physical)}` : "Sem impresso"} · {b.has_digital ? `Digital ${brl(b.price_digital)}` : "Sem digital"}
                  {b.has_digital && !b.ebook_path && " · falta o arquivo digital"}
                </span>
                <details style={{ marginTop: ".6rem" }}><summary style={{ cursor: "pointer" }}>Editar livro</summary><div style={{ marginTop: "1rem" }}><BookForm book={b} /></div></details>
              </div>
              <div className="acts">
                <form action={setLaunch}><input type="hidden" name="id" value={b.id} /><button className={isLaunch ? "on" : ""} disabled={isLaunch}>{isLaunch ? "★ Lançamento atual" : "Tornar lançamento"}</button></form>
                {!isLaunch && (
                  <form action={toggleShowcase}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="show" value={b.show_in_showcase ? "0" : "1"} /><button className={b.show_in_showcase ? "on" : ""}>{b.show_in_showcase ? "Na vitrine (retirar)" : "Fora da vitrine (mostrar)"}</button></form>
                )}
                <form action={moveBook}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} aria-label="Subir na ordem">↑</button></form>
                <form action={moveBook}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === books.length - 1} aria-label="Descer na ordem">↓</button></form>
                {!isLaunch && (
                  <details><summary style={{ cursor: "pointer", fontSize: ".85rem", padding: ".6rem 0" }}>Excluir</summary>
                    <form action={deleteBook}><input type="hidden" name="id" value={b.id} /><button>Sim, excluir este livro</button></form>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card"><h3 style={{ marginBottom: "1rem" }}>Cadastrar novo livro</h3><BookForm /></div>
    </div>
  );
}
