# Constituição — Starian CRUD

## Identidade do Projeto

**Nome:** Starian CRUD  
**Domínio:** Gestão de Pessoas (Nome, Email, CPF, Data de Nascimento, Telefone)  
**Stack:** NestJS (backend) + Vue 3 (frontend) + PostgreSQL  
**Metodologia:** Desenvolvimento Orientado por Especificação (SDD)

---

## Princípios Arquiteturais

### Backend (NestJS)

1. **Separação estrita de camadas** — A aplicação é dividida em exatamente três camadas: Controller, Service, Repository. Nenhuma camada pode acessar outra fora de sua ordem.

2. **Controllers são finos** — Controllers fazem apenas: receber a requisição, delegar ao service, retornar a resposta. Zero lógica de negócio nos controllers.

3. **Services são donos das regras de negócio** — Toda lógica de negócio, validações de domínio e orquestração vivem na camada de service. Services não conhecem HTTP.

4. **Repositories são donos do acesso a dados** — A única camada que interage com o banco de dados. Nenhuma chamada ao ORM fora do repository.

5. **DTOs guardam a fronteira** — Toda requisição de entrada deve ser validada por um DTO anotado com `class-validator`. Nenhum dado não validado entra na camada de service.

6. **Validators customizados são isolados** — Lógica de validação específica do domínio (ex: CPF) vive em classes de validação dedicadas, não dentro de DTOs ou services.

7. **Erros são centralizados** — Um `ExceptionFilter` global trata toda a formatação de erros. Services lançam exceções de domínio tipadas; o filter as converte em respostas HTTP.

8. **Respostas são padronizadas** — Todas as respostas da API seguem um envelope consistente: `{ success, data, message }` para sucesso e `{ success, error: { code, message, details } }` para erros.

### Frontend (Vue 3)

9. **Componentes nunca chamam APIs diretamente** — A comunicação HTTP é feita exclusivamente pelos módulos de service. Componentes emitem eventos e recebem dados via props.

10. **Views orquestram, componentes renderizam** — Views são responsáveis por conectar services e componentes. Componentes são puramente apresentacionais.

11. **Composables extraem lógica** — Lógica stateful reutilizável (validação de formulário, estados de carregamento, tratamento de erros) vive em composables, não dentro de componentes.

12. **Estrutura de pastas orientada ao domínio** — O código é organizado por domínio (`modules/person/`) antes de por papel técnico (components, services, views).

13. **Tipagem forte é inegociável** — Interfaces TypeScript para todos os objetos de domínio e respostas de API. Uso de `any` é proibido.

---

## Regras de Qualidade de Código

- **Sem magic strings** — Literais de string repetidos (códigos de erro, rotas) devem ser extraídos como constantes.
- **Sem código comentado** — Código morto é deletado, não comentado.
- **Sem God objects** — Arquivos com responsabilidade única e clara.
- **Explícito sobre implícito** — Assinaturas de funções e tipos de retorno devem ser explícitos.
- **Early return** — Evitar condicionais profundamente aninhadas; cláusulas de guarda são preferidas.

---

## O que é Proibido

| Proibido | Onde | Motivo |
|---|---|---|
| Lógica de negócio | Controller | Viola o SRP |
| Chamadas diretas ao banco | Service | Viola o layering |
| `fetch`/`axios` direto | Componente Vue | Quebra a separação |
| Tipo `any` | Em qualquer lugar | Anula o TypeScript |
| Entrada não validada | Camada de Service | Fronteira de segurança |
| Mensagens de erro genéricas | Respostas da API | Má experiência de desenvolvimento/usuário |

---

## Convenções de Nomenclatura

### Backend
- Arquivos: `kebab-case` (ex: `person.service.ts`)
- Classes: `PascalCase` (ex: `PersonService`)
- Métodos: `camelCase` (ex: `findById`)
- DTOs: `PascalCase` com sufixo `Dto` (ex: `CreatePersonDto`)
- Exceções: `PascalCase` com sufixo `Exception` (ex: `PersonNotFoundException`)

### Frontend
- Arquivos: `PascalCase` para componentes (ex: `PersonForm.vue`), `camelCase` para services/composables
- Composables: prefixados com `use` (ex: `usePersonForm`)
- Tipos: interfaces em `PascalCase` (ex: `Person`, `ApiResponse<T>`)

---

## Filosofia de Testes

- Testes unitários cobrem: validators, services (com repository mockado), composables
- Testes de integração cobrem: endpoints do controller (com service mockado)
- Nenhum teste é escrito para getters/setters triviais

---

## Definição de Pronto

Uma funcionalidade está completa somente quando:
- [ ] Todas as camadas estão implementadas e devidamente separadas
- [ ] Todas as entradas são validadas via DTOs
- [ ] Erros retornam respostas estruturadas
- [ ] TypeScript não apresenta erros (`tsc --noEmit`)
- [ ] O código passa no lint sem avisos
