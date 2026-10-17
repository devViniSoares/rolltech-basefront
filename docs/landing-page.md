# Landing page Rolltech

Implementação Angular dos frames [Desktop (15:2)](https://www.figma.com/design/nqaNh41NWj5N4mKPthFLH0?node-id=15-2) e [Mobile (15:11)](https://www.figma.com/design/nqaNh41NWj5N4mKPthFLH0?node-id=15-11).

- Referências: desktop de 1440 px e mobile de 390 px.
- Breakpoint mobile: 767 px. As larguras intermediárias usam layout fluido.
- Fonte Manrope local, com licença OFL, e SVGs originais locais.
- Navegação por âncoras, menu mobile com Escape, campos com labels e erros acessíveis.
- Os links das frentes de atuação selecionam o interesse no formulário, sem substituir a mensagem digitada.
- Nenhum dado de contato é salvo em localStorage ou registrado em logs.

## Execução

O Angular instalado requer Node ^22.22.3, ^24.15.0 ou >=26.0.0.

```sh
npm start
npm run build
npx ng test --watch=false --browsers=ChromeHeadless
```

## Integração do formulário

O endpoint ainda não foi informado. O token `CONTACT_ENDPOINT` tem valor padrão `null`. Nesse estado, o formulário valida os campos, informa indisponibilidade e preserva os dados, sem enviar requisições nem apresentar confirmação falsa.

Quando a API existir, adicionar ao array de providers em `src/app/app.config.ts`:

```ts
import { CONTACT_ENDPOINT } from './landing/contact.service';

// Em providers:
{ provide: CONTACT_ENDPOINT, useValue: '/api/contact' }
```

O serviço envia POST JSON com `name`, `company`, `email`, `whatsapp`, `challenge` e `service` (opcional, null quando não selecionado). WhatsApp é opcional e enviado apenas com dígitos. A API precisa validar os dados no servidor e retornar um status HTTP 2xx somente quando aceitar a solicitação. Respostas de erro e timeout de 15 segundos preservam os campos para nova tentativa. Configure o destino real antes de publicar a captura de contatos.

## Organização dos commits

- `feat: add Rolltech brand assets and visual foundations`: SVGs, fontes, estilos globais e metadados da página.
- `feat: implement responsive Rolltech landing page from Figma`: seções responsivas, navegação e formulário de contato.
- `test: cover landing navigation and contact submission states`: testes e esta documentação.

As alterações preexistentes em `angular.json`, `package.json`, `package-lock.json` e `.nvmrc` ficaram fora desses commits.

## Validação realizada

- Build de produção com prerender: aprovado, sem avisos de orçamento.
- Seis testes em ChromeHeadless: aprovados.
- Navegação, menu, seleção de interesse e formulário verificados no navegador.
- Larguras de 320, 390, 768, 1024 e 1440 px: sem rolagem horizontal, sem erros JavaScript e com todos os SVGs visíveis carregados.
- Comparação visual: desktop 1440 × 4548 e mobile 390 × 6184, com as alturas das referências do Figma.
- Capturas e relatório local em `tmp/landing-1440.png`, `tmp/landing-390.png` e `tmp/visual-qa.json` (ignorados pelo Git).

O Node do sistema estava em 22.14.0; a validação utilizou Node 22.22.3 em `tmp/node-runtime/node.exe`. A instalação anterior de `node_modules` estava incompleta e foi reconstruída. O `npm ci` encontrou inconsistências preexistentes entre os manifests; eles foram preservados e a recuperação local usou `npm install --no-save --package-lock=false`. O lockfile precisa ser reconciliado com as alterações de dependências já existentes antes de exigir uma instalação limpa no CI.
