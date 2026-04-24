# Plano Técnico — CRUD de Pessoas

## Stack Tecnológica

### Backend
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Node.js | ^22 | LTS atual, performance e suporte moderno |
| NestJS | ^10 | Framework opinado, modular, suporte nativo a DI e decorators |
| TypeScript | ^5 | Tipagem estrita em toda a aplicação |
| TypeORM | ^0.3 | ORM maduro com suporte completo ao TypeScript e PostgreSQL |
| PostgreSQL | ^15 | Banco relacional robusto, adequado ao domínio |
| class-validator | ^0.14 | Validação declarativa via decorators nos DTOs |
| class-transformer | ^0.5 | Transformação e serialização de objetos |

### Frontend
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Vue 3 | ^3.4 | Composition API, reatividade de alta performance |
| Vite | ^5 | Build tool moderna, HMR instantâneo |
| TypeScript | ^5 | Tipagem estrita no frontend |
| Axios | ^1 | Cliente HTTP robusto, interceptors para tratamento global |
| Tailwind CSS | ^3 | Utility-first, componentização visual sem CSS custom |

---

## Arquitetura Backend

### Estrutura de Camadas

```
Requisição HTTP
      │
      ▼
┌─────────────────────────────┐
│        Controller           │  ← Recebe, valida via Pipe, delega
│  (person.controller.ts)     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│          Service            │  ← Regras de negócio, orquestração
│   (person.service.ts)       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│        Repository           │  ← Acesso ao banco de dados via TypeORM
│  (person.repository.ts)     │
└────────────┬────────────────┘
             │
             ▼
        PostgreSQL
```

### Estrutura de Pastas — Backend

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── constants/
│   │   │   └── error-codes.constant.ts
│   │   ├── exceptions/
│   │   │   ├── person-not-found.exception.ts
│   │   │   ├── cpf-already-exists.exception.ts
│   │   │   └── email-already-exists.exception.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   └── validators/
│   │       └── cpf.validator.ts
│   │
│   └── modules/
│       └── person/
│           ├── person.module.ts
│           ├── person.controller.ts
│           ├── person.service.ts
│           ├── person.repository.ts
│           ├── person.entity.ts
│           ├── dtos/
│           │   ├── create-person.dto.ts
│           │   └── update-person.dto.ts
│           └── interfaces/
│               └── person-repository.interface.ts
│
├── .env.example
├── package.json
└── tsconfig.json
```

### Endpoints da API

| Método | Rota | Descrição | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/persons` | Lista todas as pessoas | — | `Person[]` |
| `GET` | `/api/persons/:id` | Busca por ID | — | `Person` |
| `POST` | `/api/persons` | Cria nova pessoa | `CreatePersonDto` | `Person` |
| `PUT` | `/api/persons/:id` | Atualiza pessoa | `UpdatePersonDto` | `Person` |
| `DELETE` | `/api/persons/:id` | Remove pessoa | — | `void` |

### Padrão de Resposta da API

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "PERSON_NOT_FOUND",
    "message": "Pessoa não encontrada",
    "details": []
  }
}
```

### Mapeamento de Exceções para HTTP

| Exceção de Domínio | HTTP Status | Código de Erro |
|---|---|---|
| `PersonNotFoundException` | 404 | `PERSON_NOT_FOUND` |
| `CpfAlreadyExistsException` | 409 | `CPF_ALREADY_EXISTS` |
| `EmailAlreadyExistsException` | 409 | `EMAIL_ALREADY_EXISTS` |
| `ValidationError` (class-validator) | 422 | `VALIDATION_ERROR` |
| Erro não tratado | 500 | `INTERNAL_ERROR` |

### Validação de CPF — Algoritmo

```
1. Remover formatação (pontos e hífen)
2. Rejeitar se todos os dígitos forem iguais
3. Calcular 1º dígito verificador:
   - Multiplicar os 9 primeiros dígitos por (10, 9, 8 ... 2)
   - Somar os resultados
   - Resto = soma % 11
   - Dígito = resto < 2 ? 0 : 11 - resto
4. Calcular 2º dígito verificador:
   - Multiplicar os 10 primeiros dígitos por (11, 10, 9 ... 2)
   - Somar os resultados
   - Resto = soma % 11
   - Dígito = resto < 2 ? 0 : 11 - resto
5. Comparar com os dígitos reais do CPF
```

---

## Arquitetura Frontend

### Estrutura de Pastas — Frontend

```
frontend/
├── src/
│   ├── main.ts
│   ├── App.vue
│   │
│   ├── core/
│   │   ├── http/
│   │   │   └── axios.instance.ts
│   │   └── types/
│   │       └── api-response.type.ts
│   │
│   ├── router/
│   │   └── index.ts
│   │
│   └── modules/
│       └── person/
│           ├── components/
│           │   ├── PersonList.vue
│           │   ├── PersonForm.vue
│           │   └── PersonDeleteDialog.vue
│           ├── composables/
│           │   └── usePersonForm.ts
│           ├── services/
│           │   └── person.service.ts
│           ├── types/
│           │   └── person.types.ts
│           └── views/
│               └── PersonView.vue
│
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Fluxo de Dados — Frontend

```
PersonView (orquestra)
    │
    ├── chama → person.service.ts (HTTP)
    │
    ├── passa props → PersonList.vue (exibe lista)
    │                     └── emite → @edit, @delete
    │
    └── passa props → PersonForm.vue (formulário)
                          │
                          ├── usa → usePersonForm.ts (validação)
                          └── emite → @submit, @cancel
```

### Responsabilidades por Arquivo

| Arquivo | Responsabilidade |
|---|---|
| `PersonView.vue` | Orquestração: gerencia estado, chama services, passa dados aos componentes |
| `PersonList.vue` | Renderiza a tabela de pessoas, emite eventos de editar/excluir |
| `PersonForm.vue` | Renderiza o formulário, delega validação ao composable, emite submit/cancel |
| `PersonDeleteDialog.vue` | Modal de confirmação de exclusão |
| `usePersonForm.ts` | Lógica de validação de formulário, estado dos campos, erros inline |
| `person.service.ts` | Todas as chamadas HTTP ao backend (CRUD completo) |
| `person.types.ts` | Interfaces TypeScript: `Person`, `CreatePersonPayload`, `UpdatePersonPayload` |
| `axios.instance.ts` | Instância configurada do Axios com baseURL e interceptors |
| `api-response.type.ts` | Tipo genérico `ApiResponse<T>` para todas as respostas |

---

## Configuração do Ambiente

### Variáveis de Ambiente — Backend

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=starian_crud

# Aplicação
APP_PORT=3000
NODE_ENV=development
```

### Variáveis de Ambiente — Frontend

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Decisões Arquiteturais

### DA-01 — Interface de Repository
O `PersonRepository` implementa uma interface `IPersonRepository`. Isso desacopla o service da implementação concreta, facilitando substituição (ex: trocar TypeORM por outro ORM) e mocking em testes.

### DA-02 — Exceções de Domínio Tipadas
Em vez de lançar `HttpException` diretamente no service (o que acoplaria o domínio ao HTTP), o service lança exceções de domínio puras. O `ExceptionFilter` global é o único responsável por fazer a conversão para HTTP.

### DA-03 — Interceptor de Resposta
Um `ResponseInterceptor` global garante que todas as respostas de sucesso sigam o envelope padrão, sem que cada controller precise formatar manualmente.

### DA-04 — CPF Imutável
O CPF é um identificador natural único de uma pessoa física. Permitir sua alteração criaria inconsistências de dados. O campo é tratado como somente leitura no `UpdatePersonDto` (omitido via `PartialType` com exclusão explícita).

### DA-05 — Separação frontend/backend em monorepo
O projeto usa a estrutura `backend/` e `frontend/` na raiz, facilitando execução independente e mantendo clareza de separação sem a complexidade de um monorepo com workspaces.
