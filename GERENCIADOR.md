# Gerenciador de conteúdo (mock)

Acesse `/admin`. Não há autenticação nem banco nesta demonstração, conforme solicitado. Nenhuma alteração é publicada remotamente.

O site foi reconstruído com abertura laranja, painel de atendimento, seletor interativo de soluções, apresentação pessoal, etapas, FAQ e contato. As configurações continuam controlando o conteúdo. A foto aparece na apresentação pessoal; o painel da abertura utiliza os campos de atendimento. Valores antigos que ainda coincidiam com os textos iniciais são adaptados ao novo design, preservando edições pessoais.

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

## Rascunho e salvamento

A prévia recebe as alterações antes de salvar. **Salvar no navegador** grava no `localStorage` deste domínio; abas do site no mesmo navegador recebem as alterações. Recarregar preserva o conteúdo salvo. Outro dispositivo, navegador ou domínio terá configurações independentes. Alterações não salvas geram aviso ao fechar a página.

Exporte o JSON para backup. Importar e restaurar o conteúdo inicial alteram o rascunho: salve para aplicar ao site. A importação valida estrutura, limites, links, cores e telefone e descarta propriedades desconhecidas.

O título e a descrição de SEO editados são atualizados no navegador. Enquanto o gerenciador estiver mockado, o HTML inicial e os metadados fornecidos ao buscador continuam usando os valores de `app/layout.js`. A integração com o banco deverá fornecer esses dados ao renderizador do servidor.

## Estrutura para a integração futura

`app/site-config.js`: valores iniciais, rótulos e validação.

`app/use-site-config.js`: leitura local e comunicação com a prévia. Este é o ponto para substituir `localStorage` por uma API.

`app/admin/page.js`: edição, importação, exportação e prévia.

Antes de habilitar publicação real, adicionar autenticação e autorização no servidor, armazenamento persistente, histórico de alterações e leitura de metadados no servidor. A demonstração não possui um login fictício que possa ser confundido com proteção real.

## Verificação

`npm test` valida o formato das configurações e as regras de importação. `npm run build` verifica o projeto Next.js. Desenvolvimento usa `.next-dev` e produção usa `.next`, evitando conflito entre o servidor da prévia e o build.

## Perfil profissional
Em Perfil e experiência configure nome, cargo, empresa, região, ano de início, marcos da carreira, certificações e perfis sociais. Campos factuais vazios não aparecem no site. A foto enviada em Sobre e foto é compartilhada com a abertura. O espaço provisório não representa uma pessoa real. Preencha apenas dados confirmados.
