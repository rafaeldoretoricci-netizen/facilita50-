import Link from "next/link";
import BookCover from "@/components/BookCover";
import { getBooks, getSettings } from "@/lib/data";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="lp-ico"><path d={d} /></svg>
);

const BENEFITS = [
  ["Cursos em vídeo, passo a passo", "Aulas curtas sobre celular, WhatsApp, internet e aplicativos do dia a dia. Assista quantas vezes quiser, no seu ritmo.", "M3 5h18v13H3zM10 9l5 2.5-5 2.5z"],
  ["Segurança contra golpes", "Aprenda a reconhecer mensagens falsas, proteger suas senhas e usar o banco pelo celular com tranquilidade.", "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6zM9 12l2 2 4-4"],
  ["Livros digitais e artigos", "Materiais com letras grandes e linguagem simples, incluídos na sua assinatura.", "M4 5h7a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-7a2 2 0 00-2 2v12a2 2 0 012-2h7z"],
  ["Entrevistas inspiradoras", "Conversas sobre longevidade, aprendizado e histórias de quem começou depois dos 50.", "M12 4a4 4 0 110 8 4 4 0 010-8zM4 21c1-4 4.5-6 8-6s7 2 8 6"],
  ["Gente que caminha junto", "Uma comunidade acolhedora, onde ninguém tem vergonha de perguntar e todo mundo ajuda.", "M7 4a3 3 0 110 6 3 3 0 010-6zM17 4a3 3 0 110 6 3 3 0 010-6zM2 20c.6-3 2.6-5 5-5s4.4 2 5 5M12 20c.6-3 2.6-5 5-5s4.4 2 5 5"],
  ["Novidades todo mês", "Conteúdos novos chegam sempre, pensados a partir das dúvidas dos próprios membros.", "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"],
];

const WHY = [
  ["Mais autonomia", "Falar com a família por vídeo, marcar consultas, resolver o banco e pedir um transporte sem depender de ninguém.", "M5 12l5 5L20 7"],
  ["Mais segurança", "Quem conhece a tecnologia percebe o golpe antes de cair nele. Informação é a melhor proteção.", "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"],
  ["Mente ativa e novas amizades", "Aprender coisas novas estimula o cérebro, e aprender em grupo traz convivência, troca e alegria.", "M12 21s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.6-7 10-7 10z"],
];

export default async function Home() {
  const [books, settings] = await Promise.all([getBooks(), getSettings()]);
  const launch = books.find((b) => b.id === settings.launch_book_id) ?? books[0];
  const others = books.filter((b) => b.id !== launch?.id && b.show_in_showcase);

  return (
    <div className="lp">
      {/* ===== Seção 1: o criador ===== */}
      <section className="lp-author">
        <div className="wrap lp-author-grid">
          <div className="lp-author-photo">
            <div className="lp-halo" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/j-ricardo-temoteo-recorte.webp" alt="J. Ricardo Temóteo, criador da Facilita 50+" width={512} height={900} />
          </div>
          <div className="lp-author-text">
            <span className="lp-eyebrow">Criador da Comunidade Facilita 50+</span>
            <h1>Olá, eu sou <em>J. Ricardo Temóteo</em>.</h1>
            <p className="lp-lead">Há quase trinta anos ajudo pessoas com mais de 50 anos a usar a tecnologia com confiança, calma e alegria.</p>
            <p>Sou poeta, publicitário e pedagogo, com especialização em Gerontologia. Escrevo desde menino: aos treze anos imaginei em versos um homem de cabelos prateados que procurava a própria história. Hoje reencontro aquelas palavras com novos sentidos.</p>
            <p>Criei o Método Néctar de Letramento Digital, apresentado num congresso internacional de Universidades da Terceira Idade em Québec, no Canadá. Ensinei em instituições como a Escola Superior do Ministério Público da União, o Governo do Ceará e a Prefeitura de Fortaleza, e aprendi com cada aluno que a educação transforma quem aprende e quem ensina.</p>
            <ul className="lp-stats">
              <li><b>1997</b><span>ensinando o público 50+</span></li>
              <li><b>11</b><span>livros publicados</span></li>
              <li><b>Canadá</b><span>Método Néctar apresentado em congresso internacional</span></li>
            </ul>
            <div className="lp-cta">
              <a className="btn lp-btn-light" href="#lancamento">Conheça meu novo livro</a>
              <a className="btn lp-btn-outline" href="#comunidade">Faça parte da Comunidade</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Seção 2: lançamento ===== */}
      {launch && (
        <section className="lp-launch" id="lancamento">
          <div className="wrap">
            <div className="lp-launch-grid">
              <div className="lp-cover">
                <BookCover book={launch} className="c lp-cover-img" />
              </div>
              <div className="lp-launch-text">
                <span className="lp-eyebrow lp-eyebrow-dark">Lançamento</span>
                <h2 className="lp-book-title">{launch.title}</h2>
                <p className="lp-by">{launch.author}</p>
                {launch.slug === "o-amor-e-o-caminho" && (
                  <p className="lp-quote">“Com a sensibilidade de um poeta e a sinceridade de um aprendiz.”</p>
                )}
                {launch.synopsis && <p className="lp-syn">{launch.synopsis}</p>}
                <div className="lp-buy">
                  {launch.has_physical && (
                    <div className="lp-buy-card">
                      <span>Livro impresso</span>
                      <b>{brl(launch.price_physical)}</b>
                      <small>Entregamos na sua casa</small>
                      <Link className="btn btn-main" href={`/livros/${launch.slug}/comprar?formato=impresso`}>Comprar impresso</Link>
                    </div>
                  )}
                  {launch.has_digital && (
                    <div className="lp-buy-card">
                      <span>Livro digital</span>
                      <b>{brl(launch.price_digital)}</b>
                      <small>Leia no celular ou computador</small>
                      <Link className="btn btn-ghost" href={`/livros/${launch.slug}/comprar?formato=digital`}>Comprar digital</Link>
                    </div>
                  )}
                </div>
                <p className="lp-secure">Pagamento seguro pelo Mercado Pago · Pix, cartão em até 3x ou boleto</p>
              </div>
            </div>

            {!settings.only_launch && others.length > 0 && (
              <div className="lp-shelf" id="livros">
                <h3>Outros livros do autor</h3>
                <div className="lp-shelf-row">
                  {others.map((b) => (
                    <Link className="lp-mini-book" href={`/livros/${b.slug}/comprar`} key={b.id}>
                      <BookCover book={b} />
                      <b>{b.title}</b>
                      <span>{b.subtitle} · a partir de {brl(Math.min(...[b.price_physical, b.price_digital].filter((x): x is number => x != null).map(Number)))}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Seção 3: comunidade ===== */}
      <section className="lp-community" id="comunidade">
        <div className="wrap">
          <div className="lp-head">
            <span className="lp-eyebrow lp-eyebrow-dark">Comunidade Facilita 50+</span>
            <h2>Aprender junto é mais leve.</h2>
            <p>Um espaço on-line, seguro e acolhedor, feito para quem tem 50 anos ou mais e quer usar a tecnologia a seu favor. Sem pressa, sem palavras difíceis e sem vergonha de perguntar.</p>
          </div>
          <div className="lp-benefits">
            {BENEFITS.map(([t, d, path]) => (
              <article key={t}>
                <Icon d={path} />
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <div className="lp-plan">
            <div>
              <span className="lp-eyebrow lp-eyebrow-dark">Assinatura mensal</span>
              <p className="lp-price">{brl(settings.community_price)}<small> por mês</small></p>
              <p>Acesso a todos os cursos, livros digitais, artigos e entrevistas. Cancele quando quiser, sem multa.</p>
            </div>
            <div className="lp-plan-cta">
              <Link className="btn btn-main lp-btn-big" href="/comunidade/assinar">Quero assinar a Comunidade</Link>
              <Link className="btn btn-ghost" href="/entrar">Já sou membro, quero entrar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Seção 4: por que se atualizar ===== */}
      <section className="lp-why">
        <div className="wrap">
          <div className="lp-head lp-head-light">
            <span className="lp-eyebrow">Nunca é tarde para aprender</span>
            <h2>A tecnologia faz parte da vida. E você não precisa aprender sozinho.</h2>
            <p>Hoje quase tudo passa pelo celular: conversar com os netos, cuidar da saúde, resolver o banco, guardar as memórias da família. Quem se atualiza ganha liberdade. Na Comunidade Facilita 50+, você aprende num ambiente seguro e colaborativo, com explicações claras e gente que caminha no mesmo ritmo.</p>
          </div>
          <div className="lp-why-grid">
            {WHY.map(([t, d, path]) => (
              <article key={t}>
                <Icon d={path} />
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <blockquote className="lp-final-quote">
            “A troca de saberes transforma a vida de quem aprende e de quem ensina.”
            <cite>J. Ricardo Temóteo</cite>
          </blockquote>
          <div className="lp-cta lp-cta-center">
            <Link className="btn lp-btn-light lp-btn-big" href="/comunidade/assinar">Quero fazer parte da Facilita 50+</Link>
            <a className="btn lp-btn-outline" href="#lancamento">Ver o livro de lançamento</a>
          </div>
        </div>
      </section>
    </div>
  );
}
