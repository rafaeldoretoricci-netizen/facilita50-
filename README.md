# Facilita 50+

Plataforma de livros, cursos e comunidade para o público 50+, de J. Ricardo Temóteo.

- **Página inicial:** livro de lançamento em destaque, vitrine com os outros livros (pode ser escondida) e convite para a Comunidade Facilita 50+.
- **Loja de livros:** impresso (com endereço e frete fixo) ou digital (download protegido), pago no Mercado Pago com Pix, cartão ou boleto.
- **Comunidade:** cadastro e assinatura mensal recorrente no cartão pelo Mercado Pago. O acesso é liberado sozinho quando o pagamento é confirmado.
- **Área de membros (estilo streaming):** destaque no topo, "Continue assistindo" com barra de progresso, fileiras por categoria com setas, catálogo com filtros, página do curso com lista de aulas e página da aula com "concluí esta aula" e próxima aula. Também mostra livros digitais e artigos.
- **Minha conta:** situação da assinatura, histórico de pagamentos e cancelamento.
- **Painel do administrador** (`/admin`): receita do mês, pedidos de livros (com "marcar como enviado"), vitrine (trocar lançamento, mostrar ou esconder livros, preços, capas e arquivos), conteúdos dos membros e lista de assinantes com situação de pagamento.

Tecnologia: Next.js 16 (hospedado na Vercel), Supabase (login, banco de dados e arquivos) e Mercado Pago.

Sem as chaves configuradas, o site abre em modo demonstração: a página inicial, a loja e a área de membros mostram conteúdos de exemplo, mas compras, cadastro e o painel ficam desativados.

## Como colocar no ar

### 1. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo).
2. Em **SQL Editor**, rode os arquivos de `supabase/migrations/` em ordem (`0001`, depois `0002`). Ele cria as tabelas, as regras de segurança, os espaços de arquivos e os livros iniciais.
3. Em **Authentication > URL Configuration**, coloque o endereço do site em *Site URL* e adicione `https://SEU-SITE/auth/callback` em *Redirect URLs*.
4. Em **Project Settings > API**, copie a URL, a chave `anon` e a chave `service_role`.

### 2. Mercado Pago
1. Em [Suas integrações](https://www.mercadopago.com.br/developers/panel/app), crie uma aplicação e copie o **Access Token** (use o de teste primeiro).
2. Em **Webhooks**, cadastre `https://SEU-SITE/api/webhooks/mercadopago` com os eventos **Pagamentos** e **Planos e assinaturas**. Copie a **assinatura secreta**.

### 3. Vercel
1. Importe este repositório na Vercel.
2. Em **Settings > Environment Variables**, preencha as variáveis do arquivo `.env.example`.
3. Publique.

### 4. Tornar-se administrador
Crie sua conta pelo site (Comunidade > assinar, ou peça um link de acesso) e rode no SQL Editor do Supabase:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'SEU-EMAIL');
```

Pronto: o link **Painel** aparece no topo do site. Administradores acessam a área de membros sem assinar.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
npm run lint                 # verificação de tipos
```

Para testar os avisos do Mercado Pago no seu computador, exponha a porta 3000 (por exemplo com `ngrok`) e use esse endereço no webhook.

## Como funciona o pagamento

- **Livros:** o pedido é registrado, a pessoa paga no Mercado Pago e volta para `/compra/obrigado`. Quando o Mercado Pago avisa que o pagamento foi aprovado, o pedido vira "Pago". No livro digital, o botão de download aparece na página do pedido.
- **Assinatura:** a pessoa cria o acesso, informa o cartão no Mercado Pago e a cobrança passa a ser mensal e automática. Cada mensalidade paga aparece em **Pagamentos**. Se uma cobrança for recusada, a assinatura fica "Pagamento atrasado" (o acesso continua enquanto o Mercado Pago tenta de novo) e, se for cancelada, o acesso é encerrado.

## Próximos passos sugeridos
- E-mails automáticos (confirmação de compra e boas-vindas), por exemplo com Resend.
- Cálculo de frete pelo CEP com Melhor Envio.
- Progresso das aulas ("continue de onde parou").
