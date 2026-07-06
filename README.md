# Cadastro Produto

Painel administrativo da Delicia Potiguar para gerenciar produtos, pedidos, loja e conta do usuario. O projeto foi feito com React, TypeScript e Vite, consumindo a API do backend `back-camarao`.

## Funcionalidades

- Login, cadastro e validacao de sessao.
- Cadastro, edicao, listagem, filtro e remocao de produtos.
- Upload de imagens de produtos via ImgBB.
- Acompanhamento de pedidos e atualizacao de status.
- Edicao de dados da conta.
- Edicao dos dados da loja, taxas e horarios de funcionamento.
- Tema claro/escuro salvo no navegador.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router DOM
- ESLint

## Requisitos

- Node.js instalado.
- Backend `back-camarao` rodando.
- Uma chave da ImgBB para upload de imagens.

## Configuracao

Crie um arquivo `.env` na raiz de `cadastro-produto` com as variaveis:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_IMGBB_KEY=sua_chave_imgbb
```

`VITE_API_BASE_URL` deve apontar para a URL base da API. O frontend usa rotas como `/api/v1/auth/me`, `/v1/produtos`, `/v1/pedidos` e `/v1/lojas`.

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O Vite abrira a aplicacao no navegador. Se nao abrir automaticamente, acesse a URL mostrada no terminal.

## Scripts

```bash
npm run dev
```

Roda a aplicacao em modo desenvolvimento.

```bash
npm run build
```

Compila TypeScript e gera a versao de producao em `dist`.

```bash
npm run lint
```

Executa o ESLint no projeto.

```bash
npm run preview
```

Serve localmente a build de producao.

## Rotas Principais

- `/login`: tela de login.
- `/register`: cadastro de usuario.
- `/produtos`: gestao de produtos.
- `/pedidos`: gestao de pedidos.
- `/clientes`: tela reservada para clientes.
- `/relatorios`: tela reservada para relatorios.
- `/configuracoes`: tela reservada para configuracoes.
- `/editar-conta`: edicao de conta.
- `/editar-loja`: edicao da loja.

As rotas administrativas ficam protegidas por validacao de sessao.

## Estrutura

```text
src/
  api/                 clientes de API e servicos
  components/          componentes principais do painel
  features/            tipos, constantes e utilitarios por dominio
  pages/               paginas de login, cadastro, pedidos e conta
  routes/              configuracao de rotas e rotas privadas
  App.tsx              layout principal autenticado
  main.tsx             entrada da aplicacao
  styles.css           estilos globais do painel
```

## Integracao com a API

O cliente HTTP esta em `src/api/api.ts` e usa `fetch` com `credentials: 'include'`, entao a autenticacao depende dos cookies enviados pelo backend.

Servicos principais:

- `authService.ts`: login e usuario atual.
- `productService.ts`: CRUD de produtos.
- `pedidoService.ts`: listagem e atualizacao de status dos pedidos.
- `lojaService.ts`: CRUD de lojas.
- `imageService.ts`: upload de imagens para ImgBB.

## Observacoes

- Os textos do projeto usam ASCII para manter consistencia com os arquivos atuais.
- O formulario de produto exige nome, preco, descricao, categoria e imagem.
- O upload de imagem falha se `VITE_IMGBB_KEY` nao estiver configurada.
