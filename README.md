# Catálogo de Filmes - Social Movie Discovery

Bem-vindo ao projeto Catálogo de Filmes! Uma aplicação web desenvolvida para entusiastas de cinema, permitindo descobrir filmes, gerenciá-los em listas pessoais e interagir com amigos em um "Tinder Mode" para escolhas de filmes em grupo (Party Mode).

## Índice

*   [Visão Geral](#visão-geral)
*   [Funcionalidades Principais](#funcionalidades-principais)
*   [Tecnologias Utilizadas](#tecnologias-utilizadas)
*   [Estrutura do Projeto](#estrutura-do-projeto)
*   [Pré-requisitos](#pré-requisitos)
*   [Configuração e Instalação](#configuração-e-instalação)
    *   [Backend (Node.js)](#backend-nodejs)
    *   [Frontend (Vue.js)](#frontend-vuejs)
*   [Variáveis de Ambiente](#variáveis-de-ambiente)
*   [Scripts Disponíveis](#scripts-disponíveis)
*   [Endpoints da API (Exemplos)](#endpoints-da-api-exemplos)
*   [Próximos Passos e Melhorias Futuras](#próximos-passos-e-melhorias-futuras)
*   [Contribuição](#contribuição)
*   [Licença](#licença)

## Visão Geral

Este projeto visa criar uma plataforma rica em funcionalidades para amantes de filmes, combinando um extenso catálogo (alimentado pela API do The Movie Database - TMDB) com recursos sociais. O destaque é o "Party Mode", onde usuários podem criar ou entrar em salas para dar "match" em filmes em conjunto, facilitando a escolha do que assistir em grupo.

## Funcionalidades Principais

*   **Autenticação de Usuário:** Registro e Login com JWT.
*   **Perfil de Usuário:**
    *   Visualização e atualização de dados (nome, email).
    *   Atualização de senha.
    *   Gerenciamento de gêneros favoritos.
*   **Catálogo de Filmes:**
    *   Listagem de filmes populares, em alta, em cartaz, mais bem avaliados.
    *   Busca de filmes por título.
    *   Detalhes completos do filme (sinopse, elenco, trailers, etc.).
    *   Busca de filmes por gênero.
*   **Listas Pessoais:**
    *   Filmes Favoritos (adicionar/remover/listar).
    *   Watchlist (adicionar/remover/listar).
*   **Party Mode (Tinder de Filmes em Grupo):**
    *   Criação de "Parties" (salas).
    *   Entrar e sair de Parties.
    *   Mecanismo de "swipe" (like/dislike) em filmes sugeridos para a party.
    *   Detecção de "matches" quando múltiplos membros da party dão "like" no mesmo filme.
    *   Sugestões de filmes baseadas nos gêneros preferidos dos membros da party.
*   **[Funcionalidade Futura] Tinder Mode Individual:** Descoberta de filmes solo com interface de swipe.
*   **[Funcionalidade Futura] WebSockets:** Atualizações em tempo real para o Party Mode (novos membros, likes, matches).

## Tecnologias Utilizadas

**Frontend:**

*   **Vue.js 3:** (Options API)
*   **Vue Router:** Para gerenciamento de rotas.
*   **Axios:** Para requisições HTTP ao backend.
*   **[Potencialmente] Pinia:** Para gerenciamento de estado global.
*   **Vue CLI:** Para scaffolding e build do projeto.
*   HTML, CSS, JavaScript

**Backend:**

*   **Node.js**
*   **Express.js:** Framework web para Node.js.
*   **MongoDB:** Banco de dados NoSQL.
*   **Mongoose:** ODM para MongoDB.
*   **jsonwebtoken (JWT):** Para autenticação baseada em token.
*   **bcryptjs:** Para hashing de senhas.
*   **Axios:** Para requisições à API externa do TMDB.
*   **dotenv:** Para gerenciamento de variáveis de ambiente.
*   **[Potencialmente] Socket.io:** Para WebSockets.

**API Externa:**

*   **The Movie Database (TMDB) API v3:** Para obtenção de dados de filmes, imagens, etc.

## Estrutura do Projeto

[Descreva brevemente a estrutura de pastas principal, por exemplo:]
```
/
├── backend/
│   ├── app.js            # Ponto de entrada do servidor Express
│   ├── .env.example      # Exemplo de variáveis de ambiente do backend
│   ├── db/
│   │   └── conn.js       # Configuração da conexão com MongoDB
│   ├── middleware/
│   │   └── authMiddleware.js # Middleware de autenticação JWT
│   ├── models/
│   │   ├── User.js       # Schema do Usuário
│   │   └── Party.js      # Schema da Party
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── partyRoutes.js
│   │   └── userRoutes.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── router/
    │   │   └── index.js    # Configuração do Vue Router
    │   ├── services/       # Módulos para chamadas API (authService, movieService, etc.)
    │   ├── stores/         # [Se usar Pinia] Stores do Pinia
    │   ├── views/
    │   ├── App.vue
    │   └── main.js       # Ponto de entrada da aplicação Vue
    ├── .env.development.example # Exemplo de variáveis de ambiente do frontend
    ├── vue.config.js
    └── package.json
```

## Pré-requisitos

*   **Node.js:** (versão [ex: 16.x ou superior])
*   **npm** ou **yarn**
*   **MongoDB:** Servidor MongoDB rodando localmente ou uma instância em nuvem (ex: MongoDB Atlas).
*   **Chave da API do TMDB:**
    *   Crie uma conta em [The Movie Database (TMDB)](https://www.themoviedb.org/).
    *   Obtenha sua chave de API v3 em Configurações > API.

## Configuração e Instalação

### Backend (Node.js)

1.  Navegue até a pasta `backend`:
    ```bash
    cd backend
    ```
2.  Crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis (veja [Variáveis de Ambiente](#variáveis-de-ambiente) abaixo):
    ```bash
    cp .env.example .env
    ```
3.  Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```
4.  Inicie o servidor backend (geralmente em modo de desenvolvimento com `nodemon`):
    ```bash
    npm run dev
    # ou
    # npm start (se definido no package.json)
    ```
    O servidor backend deverá estar rodando em `http://localhost:8005` (ou a porta definida no seu `.env`).

### Frontend (Vue.js)

1.  Navegue até a pasta `frontend`:
    ```bash
    cd frontend
    ```
2.  Crie um arquivo `.env.development` a partir do `.env.development.example` (ou `.env.local.example`) e preencha as variáveis (veja [Variáveis de Ambiente](#variáveis-de-ambiente) abaixo):
    ```bash
    cp .env.development.example .env.development
    # ou cp .env.local.example .env.local
    ```
3.  Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```
4.  Inicie o servidor de desenvolvimento do frontend:
    ```bash
    npm run serve
    ```
    A aplicação frontend deverá estar acessível em `http://localhost:8080` (ou a porta padrão do Vue CLI).

## Variáveis de Ambiente

### Backend (`backend/.env`)

*   `PORT`: Porta onde o servidor backend irá rodar (ex: `8005`).
*   `MONGODB_URI`: String de conexão do MongoDB (ex: `mongodb://localhost:27017/movie_catalog_db`).
*   `JWT_SECRET`: Um segredo forte para assinar os tokens JWT (ex: `seuSegredoSuperSecretoJWT`).
*   `JWT_EXPIRES_IN`: Tempo de expiração do token JWT (ex: `1h`, `7d`).
*   `TMDB_API_KEY_V3`: Sua chave de API v3 do The Movie Database.
*   `TMDB_BASE_URL`: (Opcional, se precisar mudar) URL base da API do TMDB (ex: `https://api.themoviedb.org/3`).

### Frontend (`frontend/.env.development` ou `.env.local`)

*   `VUE_APP_API_BASE_URL`: URL base da API do seu backend (ex: `http://localhost:8005/api`).
    *   **Importante para acesso em rede local:** Se estiver testando de outro dispositivo na mesma rede, use o IP da máquina onde o backend está rodando em vez de `localhost` (ex: `http://192.168.1.105:8005/api`).
*   `[OUTRAS_VARIAVEIS_DO_FRONTEND]`: [Se houver outras].

## Scripts Disponíveis

### Backend (`backend/package.json`)

*   `npm start`: Inicia o servidor em modo de produção (geralmente `node app.js`).
*   `npm run dev`: Inicia o servidor em modo de desenvolvimento com `nodemon` (se configurado).
*   `[outros scripts como lint, test]`

### Frontend (`frontend/package.json`)

*   `npm run serve`: Inicia o servidor de desenvolvimento do Vue.
*   `npm run build`: Compila a aplicação para produção.
*   `npm run lint`: Executa o linter.
*   `[outros scripts como test]`

## Endpoints da API (Exemplos)

Uma lista parcial dos principais endpoints do backend:

*   **Autenticação:**
    *   `POST /api/auth/register`
    *   `POST /api/auth/login`
*   **Usuários:**
    *   `GET /api/users/me`
    *   `PUT /api/users/me`
    *   `POST /api/users/me/favorite-movies`
    *   `GET /api/users/me/favorite-movies`
*   **Filmes (proxy para TMDB e sugestões):**
    *   `GET /api/movies/popular`
    *   `GET /api/movies/search?query={searchText}`
    *   `GET /api/movies/:apiMovieId/details`
    *   `GET /api/movies/suggestions/party/:partyId`
*   **Parties:**
    *   `POST /api/parties` (Criar)
    *   `POST /api/parties/:partyId/join`
    *   `POST /api/parties/:partyId/leave`
    *   `GET /api/parties/:partyId`
    *   `POST /api/parties/:partyId/movies/:apiMovieId/like`

[Adicione um link para uma documentação mais completa da API se você tiver uma, ex: Postman Collection, Swagger/OpenAPI].

## Próximos Passos e Melhorias Futuras

*   **Refatoração do Frontend:** Centralizar chamadas API com um `apiClient` e interceptores.
*   **Gerenciamento de Estado com Pinia:** Implementar stores para autenticação, parties, etc.
*   **WebSockets:** Para funcionalidades em tempo real no Party Mode.
*   **Tinder Mode Individual:** Completar a funcionalidade.
*   **Melhorias na UI/UX:** Adicionar sistema de notificações (toasts), feedback de carregamento.
*   **Testes:** Implementar testes unitários e de integração.
*   **Paginação:** Para listas longas.
*   **Validação de Entrada Avançada no Backend.**
*   **Internacionalização (i18n).**
*   **Otimizações de Performance.**
*   **Segurança:** Revisões e melhorias contínuas.

## Contribuição

[Instruções sobre como contribuir, se o projeto for aberto. Ex:
As contribuições são bem-vindas! Por favor, siga os seguintes passos:
1. Faça um Fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`).
3. Faça commit de suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4. Faça push para a branch (`git push origin feature/AmazingFeature`).
5. Abra um Pull Request.]

Ou, se for um projeto privado/pessoal:
[Este é um projeto pessoal/de estudo, mas feedbacks são bem-vindos.]

## Licença

[Apache 2.0]
