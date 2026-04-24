# Tarefas — CRUD de Pessoas

> Referência: [spec.md](./spec.md) | [plan.md](./plan.md) | [constitution.md](../../constitution.md)
>
> **Regra:** Nenhuma tarefa avança sem que a anterior esteja completa e aprovada.  
> **Status:** `[ ]` pendente · `[x]` concluída

---

## Bloco 1 — Infraestrutura do Projeto

### T-001 · Inicializar projeto NestJS
- [ ] Criar projeto com `nest new backend --package-manager npm`
- [ ] Configurar `tsconfig.json` com `strict: true`
- [ ] Instalar dependências: `@nestjs/typeorm`, `typeorm`, `pg`, `class-validator`, `class-transformer`
- [ ] Instalar dependência de ambiente: `@nestjs/config`, `dotenv`
- [ ] Criar `.env` e `.env.example` com as variáveis definidas no `plan.md`

### T-002 · Inicializar projeto Vue 3
- [ ] Criar projeto com `npm create vite@latest frontend -- --template vue-ts`
- [ ] Instalar dependências: `axios`, `vue-router`
- [ ] Instalar dependências de dev: `tailwindcss`, `@tailwindcss/forms`
- [ ] Configurar Tailwind CSS (`tailwind.config.js` + import no `main.ts`)
- [ ] Criar `.env` e `.env.example` com `VITE_API_BASE_URL`

### T-003 · Configurar banco de dados
- [ ] Criar banco PostgreSQL `starian_crud`
- [ ] Configurar `TypeOrmModule` no `app.module.ts` usando variáveis de ambiente
- [ ] Habilitar `synchronize: true` apenas para ambiente de desenvolvimento

---

## Bloco 2 — Camada de Domínio (Backend)

### T-004 · Criar estrutura de pastas do módulo `person`
- [ ] Criar `src/modules/person/` com subpastas: `dtos/`, `interfaces/`
- [ ] Criar `src/common/` com subpastas: `constants/`, `exceptions/`, `filters/`, `interceptors/`, `validators/`
- [ ] Criar todos os arquivos como stubs vazios (apenas exports)

### T-005 · Criar entidade `Person`
- [ ] Criar `person.entity.ts` com os campos definidos na `spec.md`
- [ ] Usar decorators do TypeORM: `@Entity`, `@PrimaryGeneratedColumn('uuid')`, `@Column`, `@CreateDateColumn`, `@UpdateDateColumn`
- [ ] Adicionar constraint `unique: true` nos campos `email` e `cpf`
- [ ] Referência: entidade de domínio na `spec.md`

### T-006 · Criar validador customizado de CPF
- [ ] Criar `src/common/validators/cpf.validator.ts`
- [ ] Implementar `ValidatorConstraintInterface` do `class-validator`
- [ ] Implementar o algoritmo de módulo 11 conforme descrito no `plan.md`
- [ ] Rejeitar sequências homogêneas (ex: `111.111.111-11`)
- [ ] Exportar decorator `@IsCpf()` para uso nos DTOs

### T-007 · Criar constantes de códigos de erro
- [ ] Criar `src/common/constants/error-codes.constant.ts`
- [ ] Definir objeto `ErrorCodes` com: `PERSON_NOT_FOUND`, `CPF_ALREADY_EXISTS`, `EMAIL_ALREADY_EXISTS`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

### T-008 · Criar exceções de domínio
- [ ] Criar `PersonNotFoundException` (extends `Error`)
- [ ] Criar `CpfAlreadyExistsException` (extends `Error`)
- [ ] Criar `EmailAlreadyExistsException` (extends `Error`)
- [ ] Nenhuma exceção deve importar ou conhecer classes HTTP do NestJS

---

## Bloco 3 — DTOs (Backend)

### T-009 · Criar `CreatePersonDto`
- [ ] Criar `src/modules/person/dtos/create-person.dto.ts`
- [ ] Campo `nome`: `@IsNotEmpty`, `@IsString`, `@MinLength(3)`, `@MaxLength(100)`
- [ ] Campo `email`: `@IsNotEmpty`, `@IsEmail`
- [ ] Campo `cpf`: `@IsNotEmpty`, `@Matches` (formato), `@IsCpf` (dígitos verificadores)
- [ ] Campo `dataNascimento`: `@IsNotEmpty`, `@IsDateString`, `@MaxDate(new Date())`
- [ ] Campo `telefone`: `@IsNotEmpty`, `@Matches` (formato brasileiro)

### T-010 · Criar `UpdatePersonDto`
- [ ] Criar `src/modules/person/dtos/update-person.dto.ts`
- [ ] Estender `PartialType(CreatePersonDto)` do `@nestjs/mapped-types`
- [ ] **Omitir explicitamente o campo `cpf`** (conforme RN-04 — CPF imutável)

---

## Bloco 4 — Repository (Backend)

### T-011 · Criar interface `IPersonRepository`
- [ ] Criar `src/modules/person/interfaces/person-repository.interface.ts`
- [ ] Definir os métodos: `findAll()`, `findById(id)`, `findByCpf(cpf)`, `findByEmail(email)`, `create(data)`, `update(id, data)`, `delete(id)`
- [ ] Usar tipos TypeScript puros, sem dependências do TypeORM

### T-012 · Implementar `PersonRepository`
- [ ] Criar `src/modules/person/person.repository.ts`
- [ ] Implementar `IPersonRepository`
- [ ] Injetar `Repository<Person>` via `@InjectRepository`
- [ ] Implementar todos os métodos definidos na interface

---

## Bloco 5 — Service (Backend)

### T-013 · Implementar `PersonService`
- [ ] Criar `src/modules/person/person.service.ts`
- [ ] Injetar `IPersonRepository` (não a implementação concreta)
- [ ] Implementar `findAll()`: retorna lista de pessoas
- [ ] Implementar `findById(id)`: lança `PersonNotFoundException` se não encontrada
- [ ] Implementar `create(dto)`: verifica unicidade de CPF e e-mail antes de salvar
- [ ] Implementar `update(id, dto)`: verifica existência, depois unicidade de e-mail
- [ ] Implementar `delete(id)`: verifica existência antes de remover
- [ ] Nenhum import de `HttpException` ou classes HTTP

---

## Bloco 6 — Infraestrutura HTTP (Backend)

### T-014 · Criar `HttpExceptionFilter`
- [ ] Criar `src/common/filters/http-exception.filter.ts`
- [ ] Implementar `ExceptionFilter` do NestJS
- [ ] Mapear `PersonNotFoundException` → 404
- [ ] Mapear `CpfAlreadyExistsException` → 409
- [ ] Mapear `EmailAlreadyExistsException` → 409
- [ ] Mapear erros do `class-validator` (ValidationPipe) → 422
- [ ] Mapear qualquer outro erro → 500
- [ ] Toda resposta de erro segue o envelope definido no `plan.md`

### T-015 · Criar `ResponseInterceptor`
- [ ] Criar `src/common/interceptors/response.interceptor.ts`
- [ ] Implementar `NestInterceptor`
- [ ] Envolver toda resposta de sucesso no envelope `{ success: true, data, message }`

### T-016 · Criar `PersonController`
- [ ] Criar `src/modules/person/person.controller.ts`
- [ ] Registrar rotas: `GET /api/persons`, `GET /api/persons/:id`, `POST /api/persons`, `PUT /api/persons/:id`, `DELETE /api/persons/:id`
- [ ] Usar `ValidationPipe` com `whitelist: true` e `transform: true`
- [ ] Cada método apenas delega para o service e retorna o resultado
- [ ] Zero lógica de negócio no controller

### T-017 · Registrar globals no `main.ts`
- [ ] Configurar `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- [ ] Registrar `HttpExceptionFilter` globalmente
- [ ] Registrar `ResponseInterceptor` globalmente
- [ ] Configurar prefixo global `/api`
- [ ] Habilitar CORS para `http://localhost:5173`

### T-018 · Criar e registrar `PersonModule`
- [ ] Criar `src/modules/person/person.module.ts`
- [ ] Registrar `TypeOrmModule.forFeature([Person])`
- [ ] Registrar `PersonRepository` com token de injeção `IPersonRepository`
- [ ] Importar módulo no `app.module.ts`

---

## Bloco 7 — Tipos e HTTP (Frontend)

### T-019 · Criar tipos TypeScript do domínio
- [ ] Criar `src/modules/person/types/person.types.ts`
- [ ] Definir interface `Person` com todos os campos
- [ ] Definir interface `CreatePersonPayload`
- [ ] Definir interface `UpdatePersonPayload` (sem campo `cpf`)

### T-020 · Configurar instância do Axios
- [ ] Criar `src/core/http/axios.instance.ts`
- [ ] Configurar `baseURL` a partir de `import.meta.env.VITE_API_BASE_URL`
- [ ] Criar interceptor de resposta para extrair `data` do envelope
- [ ] Criar interceptor de erro para normalizar mensagens de erro

### T-021 · Criar tipo genérico `ApiResponse<T>`
- [ ] Criar `src/core/types/api-response.type.ts`
- [ ] Definir `ApiResponse<T>` com: `success`, `data`, `message`
- [ ] Definir `ApiError` com: `success`, `error: { code, message, details }`

### T-022 · Implementar `person.service.ts` (Frontend)
- [ ] Criar `src/modules/person/services/person.service.ts`
- [ ] Implementar `getAll(): Promise<Person[]>`
- [ ] Implementar `getById(id): Promise<Person>`
- [ ] Implementar `create(payload): Promise<Person>`
- [ ] Implementar `update(id, payload): Promise<Person>`
- [ ] Implementar `remove(id): Promise<void>`
- [ ] Usar apenas a instância do Axios configurada em T-020

---

## Bloco 8 — Composables (Frontend)

### T-023 · Implementar `usePersonForm`
- [ ] Criar `src/modules/person/composables/usePersonForm.ts`
- [ ] Gerenciar estado reativo dos campos do formulário
- [ ] Validar: campos obrigatórios, formato de e-mail, CPF (algoritmo módulo 11), data de nascimento não futura, formato de telefone
- [ ] Expor: `fields`, `errors`, `isValid`, `validate()`, `reset()`
- [ ] Implementar validação de CPF idêntica à do backend (mesmo algoritmo)

---

## Bloco 9 — Componentes (Frontend)

### T-024 · Implementar `PersonList.vue`
- [ ] Renderizar tabela com colunas: Nome, E-mail, CPF (mascarado), Telefone, Ações
- [ ] Exibir estado vazio com mensagem quando a lista estiver sem registros
- [ ] Emitir evento `@edit(person: Person)` ao clicar em editar
- [ ] Emitir evento `@delete(person: Person)` ao clicar em excluir
- [ ] Aceitar `persons` como prop
- [ ] Sem chamadas de API, sem lógica de negócio

### T-025 · Implementar `PersonForm.vue`
- [ ] Renderizar formulário com todos os campos da entidade
- [ ] Campo CPF: somente leitura no modo edição (RN-04)
- [ ] Usar `usePersonForm` para validação
- [ ] Exibir mensagem de erro inline abaixo de cada campo inválido
- [ ] Destacar visualmente campos inválidos
- [ ] Emitir evento `@submit(payload)` apenas se o formulário for válido
- [ ] Emitir evento `@cancel`
- [ ] Aceitar prop `person?: Person` para pré-preenchimento no modo edição

### T-026 · Implementar `PersonDeleteDialog.vue`
- [ ] Renderizar modal de confirmação
- [ ] Exibir nome da pessoa a ser excluída
- [ ] Emitir evento `@confirm`
- [ ] Emitir evento `@cancel`
- [ ] Aceitar prop `person: Person`

---

## Bloco 10 — View e Roteamento (Frontend)

### T-027 · Implementar `PersonView.vue`
- [ ] Gerenciar estado: `persons`, `selectedPerson`, `mode: 'list' | 'create' | 'edit'`, `loading`, `error`
- [ ] Ao montar: chamar `person.service.getAll()` e popular a lista
- [ ] Ao receber `@edit`: mudar para modo `edit`, setar `selectedPerson`
- [ ] Ao receber `@delete`: abrir `PersonDeleteDialog`
- [ ] Ao receber `@submit` do form: chamar `create` ou `update` conforme o modo
- [ ] Ao receber `@confirm` do dialog: chamar `remove`
- [ ] Exibir feedback de sucesso e erro ao usuário
- [ ] Gerenciar estado de `loading` durante operações assíncronas

### T-028 · Configurar Vue Router
- [ ] Criar `src/router/index.ts`
- [ ] Definir rota `/` apontando para `PersonView`
- [ ] Registrar router no `main.ts`

---

## Bloco 11 — Entrega

### T-029 · Criar README
- [ ] Instruções de pré-requisitos (Node, Docker ou PostgreSQL local)
- [ ] Passo a passo para rodar o backend
- [ ] Passo a passo para rodar o frontend
- [ ] Variáveis de ambiente necessárias
- [ ] Decisões arquiteturais resumidas (referência ao `plan.md`)

### T-030 · Revisão final
- [ ] `tsc --noEmit` sem erros no backend
- [ ] `tsc --noEmit` sem erros no frontend
- [ ] Testar manualmente todos os fluxos das histórias de usuário (US-01 a US-05)
- [ ] Subir para repositório público no GitHub
- [ ] Verificar que o README está correto e as instruções funcionam

---

## Resumo de Dependências entre Tarefas

```
T-001 → T-003 → T-004
T-004 → T-005 → T-006 → T-007 → T-008
T-008 → T-009 → T-010
T-010 → T-011 → T-012 → T-013
T-013 → T-014 → T-015 → T-016 → T-017 → T-018

T-002 → T-019 → T-020 → T-021 → T-022
T-022 → T-023 → T-024 → T-025 → T-026 → T-027 → T-028

T-018 + T-028 → T-029 → T-030
```
