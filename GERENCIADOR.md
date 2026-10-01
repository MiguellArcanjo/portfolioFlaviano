# Gerenciador de conteúdo

Acesse `/admin` e entre com e-mail e senha. O conteúdo fica no Supabase: ao clicar em **Publicar**, todos os visitantes passam a ver a nova versão, em qualquer dispositivo.

## O que pode ser editado

- Marca, símbolo e subtítulo.
- Título da página e descrição de SEO.
- Cores principal, de fundo e de texto; ativação de animações.
- Menu, botões e seus destinos.
- Todos os textos da abertura, papel e faixa animada.
- Serviços, ícones, destaque e chamadas para contato.
- Apresentação, parágrafos, diferenciais, assinatura, foto e descrição acessível.
- Etapas de atendimento.
- Perguntas e respostas do FAQ.
- WhatsApp, rótulos do formulário, opções, modelo da mensagem e mensagens de retorno.
- Rodapé, direitos autorais, texto legal, links e acesso ao conteúdo.
- Visibilidade individual de cada seção.

As listas permitem adicionar, remover e reordenar até 30 itens. Uma foto PNG, JPEG ou WebP de até 1 MB pode ser enviada diretamente; também é possível usar uma URL. Textos são renderizados como texto, sem HTML arbitrário.

## Rascunho e publicação

A prévia mostra o rascunho enquanto você edita; nada muda para os visitantes até clicar em **Publicar**. Publicar grava no banco e atualiza o site na hora (no máximo em 5 minutos, se a atualização imediata falhar). Alterações não publicadas geram aviso ao sair ou fechar a página. A barra lateral mostra quando foi a última publicação.

Fotos enviadas vão para o Storage do Supabase (bucket `site`, até 3 MB, PNG, JPEG ou WebP); o conteúdo guarda só o endereço da imagem.

Exporte o JSON para backup. Importar e restaurar o conteúdo inicial alteram o rascunho: publique para aplicar. A importação valida estrutura, limites, links, cores e telefone e descarta propriedades desconhecidas. Se o navegador tiver conteúdo salvo pela versão antiga (sem banco), o gerenciador oferece carregá-lo na prévia.

Título e descrição de SEO são lidos no servidor, então buscadores e redes sociais veem o texto publicado.

## Configurar o Supabase (uma vez)

1. Em **Authentication → Users → Add user**, crie o usuário de quem vai editar (e-mail e senha). Em **Authentication → Sign In / Providers**, desative "Allow new users to sign up" para ninguém criar conta sozinho.
2. Abra `supabase/schema.sql`, troque `TROQUE-PELO-EMAIL@exemplo.com` pelo e-mail desse usuário e execute tudo no **SQL Editor**. O script cria a tabela do conteúdo, a lista de administradores, as regras de acesso (RLS) e o bucket de fotos. Pode ser executado de novo sem perder dados.
3. Configure as variáveis (veja `.env.example`) no `.env.local` e na Vercel: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `SUPABASE_SERVICE_ROLE_KEY` é opcional, fica só no servidor e não é usada pelo site.
4. Entre em `/admin` e clique em **Publicar** pela primeira vez.

Só e-mails listados em `site_admins` podem publicar ou enviar fotos; ter uma conta no Supabase não basta. Para adicionar alguém, crie o usuário e insira o e-mail nessa tabela.

## Estrutura

- `app/page.js`: lê o conteúdo publicado no servidor (`app/lib/content-server.js`) e define título e descrição.
- `app/site.js`: o site em si (interações, formulário, menu).
- `app/site-config.js`: valores iniciais, rótulos, validação e migração de conteúdo antigo.
- `app/admin/page.js`: login, edição, prévia, publicação, fotos e backup. `app/admin/actions.js` atualiza o site depois de publicar, só para administradores.
- `supabase/schema.sql`: estrutura e regras do banco.

## Verificação

`npm test` valida o formato das configurações e as regras de importação. `npm run build` verifica o projeto Next.js. Desenvolvimento usa `.next-dev` e produção usa `.next`, evitando conflito entre o servidor da prévia e o build.

## Perfil profissional
Em Perfil e experiência configure nome, cargo, empresa, região, ano de início, marcos da carreira, certificações e perfis sociais. Campos factuais vazios não aparecem no site. A foto enviada em Sobre e foto é compartilhada com a abertura. O espaço provisório não representa uma pessoa real. Preencha apenas dados confirmados.

## WhatsApp
Em **Contato e WhatsApp**, preencha o número que recebe as mensagens. Pode digitar com espaços, parênteses ou traço; o 55 do Brasil é incluído automaticamente. O campo mostra para qual número as mensagens irão e um link para testar. Com o número salvo, o botão "Enviar pelo WhatsApp" abre a conversa já com a mensagem pronta. Sem número, o site só prepara a mensagem para copiar. `NEXT_PUBLIC_WHATSAPP_NUMBER` continua valendo como reserva quando o campo está vazio.
