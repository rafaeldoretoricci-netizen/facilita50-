import Link from "next/link";
import BookCover from "@/components/BookCover";
import { getBooks, getSettings } from "@/lib/data";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

const BENEFITS = [
  ["Cursos em vídeo, passo a passo", "Aulas curtas sobre celular, WhatsApp, internet segura e muito mais. Assista quantas vezes quiser.", "M3 5h18v13H3zM10 9l5 2.5-5 2.5z"],
  ["Livros digitais e artigos", "Leituras para o seu dia a dia, incluídas na assinatura.", "M4 5h7a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-7a2 2 0 00-2 2v12a2 2 0 012-2h7z"],
  ["Entrevistas e conversas", "Histórias inspiradoras sobre longevidade, tecnologia e vida plena.", "M12 4a4 4 0 110 8 4 4 0 010-8zM4 21c1-4 4.5-6 8-6s7 2 8 6"],
  ["Segurança em primeiro lugar", "Aprenda a reconhecer golpes e a se proteger na internet.", "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6zM9 12l2 2 4-4"],
  ["Uma comunidade que acolhe", "Gente que fala a sua língua e caminha no mesmo ritmo.", "M7 4a3 3 0 110 6 3 3 0 010-6zM17 4a3 3 0 110 6 3 3 0 010-6zM2 20c.6-3 2.6-5 5-5s4.4 2 5 5M12 20c.6-3 2.6-5 5-5s4.4 2 5 5"],
];

export default async function Home() {
  const [books, settings] = await Promise.all([getBooks(), getSettings()]);
  const launch = books.find((b) => b.id === settings.launch_book_id) ?? books[0];
  const others = books.filter((b) => b.id !== launch?.id && b.show_in_showcase);

  return (
    <>
      {launch && (
        <section className="hero">
          <div className="wrap">
            <div>
              <span className="tag">Lançamento</span>
              <h1 style={{ marginTop: "1rem" }}>{launch.title}</h1>
              <div className="by">{launch.author}</div>
              {launch.slug === "o-amor-e-o-caminho" && (
                <p className="quote">“Com a sensibilidade de um poeta e a sinceridade de um aprendiz.”</p>
              )}
              {launch.synopsis && <p className="syn">{launch.synopsis}</p>}
              <div className="cta">
                {launch.has_physical && (
                  <Link className="btn btn-main" href={`/livros/${launch.slug}/comprar?formato=impresso`}>Quero o livro impresso</Link>
                )}
                {launch.has_digital && (
                  <Link className="btn btn-ghost" href={`/livros/${launch.slug}/comprar?formato=digital`}>Quero o livro digital</Link>
                )}
              </div>
              <p className="price">
                {launch.has_physical && `Impresso ${brl(launch.price_physical)}`}
                {launch.has_physical && launch.has_digital && " · "}
                {launch.has_digital && `Digital ${brl(launch.price_digital)}`} · Pix, cartão ou boleto
              </p>
            </div>
            <div style={{ justifySelf: "center", width: "100%", maxWidth: 340 }}>
              <BookCover book={launch} className="c cover-big" />
            </div>
          </div>
        </section>
      )}

      {!settings.only_launch && others.length > 0 && (
        <section className="band" id="livros">
          <div className="wrap">
            <div className="section-head">
              <span className="tag" style={{ alignSelf: "flex-start" }}>Outros livros do autor</span>
              <h2>Livros que facilitam a vida digital</h2>
              <p>Materiais escritos com calma, letras grandes e passo a passo, para aprender no seu ritmo. Disponíveis impressos, com entrega em casa, ou digitais, para ler no celular ou no computador.</p>
            </div>
            <div className="shelf">
              {others.map((b) => (
                <article className="book" key={b.id}>
                  <BookCover book={b} />
                  <h3>{b.title} {b.subtitle && <span style={{ fontWeight: 600, color: "var(--muted)" }}>· {b.subtitle}</span>}</h3>
                  <div className="fmt">
                    {b.has_physical && <span>Impresso {brl(b.price_physical)}</span>}
                    {b.has_digital && <span>Digital {brl(b.price_digital)}</span>}
                  </div>
                  <Link className="btn btn-main" href={`/livros/${b.slug}/comprar`}>Comprar</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="band" style={{ background: "var(--surface)" }}>
        <div className="wrap author">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/j-ricardo-temoteo.webp" alt="Foto de J. Ricardo Temóteo" />
          <div className="txt">
            <span className="tag" style={{ alignSelf: "flex-start" }}>Autor e idealizador da Facilita 50+</span>
            <h2>J. Ricardo Temóteo</h2>
            <p>Escreve desde a infância. Aos treze anos, imaginou em versos um homem de cabelos prateados que procurava sua própria história. Hoje reencontra aquelas palavras e descobre nelas novos sentidos.</p>
            <p>Poeta, publicitário e pedagogo com especialização em Gerontologia, ensina tecnologia para adultos maduros e pessoas idosas desde 1997. Criou o Método Néctar de Letramento Digital, apresentado em um congresso internacional de Universidades da Terceira Idade em Québec, no Canadá.</p>
            <p>Acredita que a educação transforma tanto quem aprende quanto quem ensina. Entre pedras e estrelas, continua sendo o aprendiz que escreve, estuda, cria e caminha.</p>
            <div className="facts">
              <span>Desde 1997 ensinando o público 50+</span>
              <span>Método Néctar</span>
              <span>Séries “Informática para a Vida” e “Celular na Prática”</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band community" id="comunidade">
        <div className="wrap">
          <div>
            <span className="tag">Comunidade Facilita 50+</span>
            <h2 style={{ marginTop: "1rem" }}>Aprender junto é mais leve. Venha fazer parte!</h2>
            <p className="lead">Um lugar seguro e acolhedor para quem tem 50 anos ou mais e quer usar a tecnologia com confiança, continuar aprendendo e fazer novas amizades. Sem pressa, sem termos difíceis e sem vergonha de perguntar.</p>
            <ul className="benefits">
              {BENEFITS.map(([t, d, path]) => (
                <li key={t}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg>
                  <div><b>{t}</b>{d}</div>
                </li>
              ))}
            </ul>
          </div>
          <aside className="plan">
            <span className="tag" style={{ alignSelf: "flex-start" }}>Assinatura mensal</span>
            <div className="amount">{brl(settings.community_price)} <small>por mês</small></div>
            <ul>
              <li>Acesso a todos os cursos e conteúdos</li>
              <li>Novos materiais todo mês</li>
              <li>Cancele quando quiser, sem multa</li>
            </ul>
            <Link className="btn btn-main" href="/comunidade/assinar">Quero fazer parte da Comunidade</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
