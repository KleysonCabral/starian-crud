# Starian CRUD — Cadastro de Pessoas

CRUD completo de pessoas físicas com NestJS (backend) e Vue 3 (frontend).

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 22 (LTS) |
| npm | 10 |
| PostgreSQL | 15 |

---

## Estrutura do projeto

```
starian-crud/
├── backend/    # API REST (NestJS + TypeORM)
└── frontend/   # SPA (Vue 3 + Vite + Tailwind CSS)
```

---

## Backend

### Configuração do ambiente

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com as credenciais do seu PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=starian_crud
APP_PORT=3000
NODE_ENV=development
```

> O banco `starian_crud` deve existir. O TypeORM cria as tabelas automaticamente em `development` (`synchronize: true`).

### Instalação e execução

```bash
cd backend
npm install
npm run start:dev
```

A API ficará disponível em: `http://localhost:3000/api`

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/persons` | Lista todas as pessoas |
| `GET` | `/api/persons/:id` | Busca pessoa por ID |
| `POST` | `/api/persons` | Cria nova pessoa |
| `PUT` | `/api/persons/:id` | Atualiza pessoa |
| `DELETE` | `/api/persons/:id` | Remove pessoa |

### Exemplo de payload — criação

```json
{
  "nome": "Maria da Silva",
  "email": "maria@exemplo.com",
  "cpf": "529.982.247-25",
  "dataNascimento": "1990-05-20",
  "telefone": "(11) 91234-5678"
}
```

---

## Frontend

### Configuração do ambiente

```bash
cd frontend
cp .env.example .env
```

O `.env.example` já tem o valor correto para desenvolvimento local:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Instalação e execução

```bash
cd frontend
npm install
npm run dev
```

A interface ficará disponível na URL exibida pelo Vite (normalmente `http://localhost:5173`).

---

## Executando os dois juntos

Abra dois terminais:

**Terminal 1 — Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Acesse no navegador a URL exibida no terminal do Vite.

---

## Stack técnica

### Backend
- **NestJS 11** — Framework com injeção de dependência e decorators
- **TypeORM 0.3** — ORM com suporte a TypeScript e PostgreSQL
- **class-validator** — Validação declarativa via decorators
- **PostgreSQL 15** — Banco de dados relacional

### Frontend
- **Vue 3** — Composition API com `<script setup>`
- **Vite** — Build tool com HMR instantâneo
- **TypeScript** — Tipagem estrita em todo o frontend
- **Axios** — Cliente HTTP com interceptors
- **Vue Router 4** — Roteamento client-side
- **Tailwind CSS 3** — Estilização utility-first

---

## Arquitetura

O backend segue arquitetura em 3 camadas com inversão de dependência:

```
Controller → Service → IPersonRepository ← PersonRepository (TypeORM)
```

Todas as respostas da API seguem o envelope padrão:

```json
// Sucesso
{ "success": true, "data": {}, "message": "Operação realizada com sucesso" }

// Erro
{ "success": false, "error": { "code": "CPF_ALREADY_EXISTS", "message": "...", "details": [] } }
```
