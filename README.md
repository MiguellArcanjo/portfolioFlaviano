# Portfólio Flaviano

Gerenciador mockado em `/admin`, com edição de conteúdo, prévia e backup JSON. Veja `GERENCIADOR.md` para os recursos e limites de salvamento no navegador.

Site em Next.js com App Router, pronto para Vercel. Execute `npm install` e `npm run dev`. Para validar a produção, execute `npm run build`.

Na Vercel, importe o repositório e mantenha o preset Next.js, com comando de build `npm run build` e diretório de saída automático. Configure o telefone antes do deploy. Não é necessário `vercel.json`.

## Personalização antes de publicar

- Confirme o nome Flaviano (inferido do nome da pasta) e o texto da apresentação.
- Configure `NEXT_PUBLIC_WHATSAPP_NUMBER` em `.env.local` ou nas variáveis de ambiente da Vercel, incluindo 55 e DDD. Sem configuração, o formulário apenas prepara e copia a mensagem.
- Confirme os serviços efetivamente oferecidos, empresa e informações profissionais. Não foram adicionadas certificações, depoimentos, bancos parceiros ou resultados sem comprovação.
- O monograma é uma composição gráfica original; pode ser substituído por uma fotografia autorizada.

## Sistema visual

Tokens CSS para cores, espaçamento e raios; tipografia Barlow Condensed e DM Sans com fallback sans-serif; hierarquia editorial; grade responsiva; componentes de botões, cards, navegação, formulário e FAQ. Estados de foco visíveis, link para pular ao conteúdo, semântica HTML, menu acessível e suporte a movimento reduzido. Sem rastreadores ou armazenamento de dados no formulário. Fontes Google são o único recurso externo.

## Referências pesquisadas

- https://direcionarcred.com.br/ — apresentação pessoal, orientação por necessidade e método de atendimento.
- https://www.promotorabcm.com.br/ — atendimento humano, linhas de serviço, etapas e perguntas frequentes.
- https://www.ribercred.com.br/ — organização de produtos e comunicação das condições de contratação.

As referências orientam a arquitetura de conteúdo. Identidade visual e implementação são próprias; dados comerciais das referências não foram reutilizados.

Pesquisa ampliada e decisões de design em REFERENCIAS.md. A versão atual usa laranja, carvão e papel claro, serviços em linhas e animações com suporte a movimento reduzido.
