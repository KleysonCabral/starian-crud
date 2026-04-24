# Especificação — CRUD de Pessoas

## Visão Geral

O sistema permite o cadastro e a gestão completa de pessoas físicas. O usuário pode registrar, visualizar, editar e remover registros de pessoas através de uma interface web.

---

## Atores

- **Usuário final:** Interage com a interface web para gerenciar os cadastros de pessoas.

---

## Entidade de Domínio: Pessoa

Uma **Pessoa** é identificada pelos seguintes atributos:

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `id` | UUID | Sim (gerado) | Gerado automaticamente pelo sistema |
| `nome` | string | Sim | Mínimo de 3 caracteres, máximo de 100 |
| `email` | string | Sim | Formato de e-mail válido, único no sistema |
| `cpf` | string | Sim | Formato `XXX.XXX.XXX-XX`, único, dígitos verificadores válidos |
| `dataNascimento` | date | Sim | Não pode ser uma data futura |
| `telefone` | string | Sim | Formato brasileiro `(XX) XXXXX-XXXX` |
| `criadoEm` | datetime | Sim (gerado) | Gerado automaticamente na criação |
| `atualizadoEm` | datetime | Sim (gerado) | Atualizado automaticamente em cada edição |

---

## Histórias de Usuário

### US-01 — Listar pessoas

**Como** usuário,  
**Quero** ver uma lista de todas as pessoas cadastradas,  
**Para que** eu possa ter uma visão geral dos registros existentes.

**Critérios de Aceitação:**
- [ ] A lista exibe: nome, e-mail, CPF (mascarado: `***.XXX.XXX-**`) e telefone
- [ ] Se não houver cadastros, a lista exibe uma mensagem de estado vazio
- [ ] A lista é ordenada por nome em ordem alfabética crescente
- [ ] Cada registro exibe ações de editar e excluir

---

### US-02 — Criar pessoa

**Como** usuário,  
**Quero** cadastrar uma nova pessoa preenchendo um formulário,  
**Para que** o registro seja salvo no sistema.

**Critérios de Aceitação:**
- [ ] O formulário contém campos para: Nome, E-mail, CPF, Data de Nascimento e Telefone
- [ ] Todos os campos são obrigatórios
- [ ] O CPF é validado pelo algoritmo de módulo 11 antes do envio
- [ ] O CPF e o e-mail são verificados quanto à unicidade pelo sistema
- [ ] Em caso de sucesso, o usuário vê uma mensagem de confirmação e o registro aparece na lista
- [ ] Em caso de erro de validação, cada campo exibe sua mensagem de erro inline
- [ ] Em caso de CPF ou e-mail duplicado, o sistema exibe mensagem específica

---

### US-03 — Editar pessoa

**Como** usuário,  
**Quero** editar os dados de uma pessoa já cadastrada,  
**Para que** eu possa corrigir ou atualizar as informações.

**Critérios de Aceitação:**
- [ ] O formulário de edição é pré-preenchido com os dados atuais da pessoa
- [ ] Todos os campos podem ser editados
- [ ] As mesmas validações da criação se aplicam na edição
- [ ] A unicidade de CPF e e-mail é verificada desconsiderando o próprio registro
- [ ] Em caso de sucesso, o usuário vê uma mensagem de confirmação e a lista é atualizada

---

### US-04 — Excluir pessoa

**Como** usuário,  
**Quero** excluir o registro de uma pessoa,  
**Para que** o cadastro seja removido permanentemente do sistema.

**Critérios de Aceitação:**
- [ ] O sistema exibe um diálogo de confirmação antes de excluir
- [ ] A exclusão é permanente (sem soft delete)
- [ ] Em caso de sucesso, o registro é removido da lista imediatamente
- [ ] Em caso de falha, o sistema exibe uma mensagem de erro

---

### US-05 — Validação de formulário

**Como** usuário,  
**Quero** receber feedback imediato sobre campos inválidos,  
**Para que** eu possa corrigir os dados antes de submeter.

**Critérios de Aceitação:**
- [ ] A validação ocorre no frontend antes da submissão (client-side)
- [ ] A validação ocorre no backend após a submissão (server-side)
- [ ] Mensagens de erro são exibidas abaixo do campo correspondente
- [ ] Campos inválidos são destacados visualmente
- [ ] O botão de submit fica desabilitado enquanto há erros de validação

---

## Regras de Negócio

### RN-01 — Validação de CPF

O CPF deve passar por dois níveis de validação:

1. **Formato:** Deve seguir o padrão `XXX.XXX.XXX-XX`
2. **Unicidade:** Não pode existir outro cadastro com o mesmo CPF
3. **Dígitos verificadores:** Calculados pelo algoritmo de módulo 11:
   - Rejeitar sequências homogêneas (ex: `111.111.111-11`)
   - Validar o 1º dígito verificador
   - Validar o 2º dígito verificador

### RN-02 — Unicidade de E-mail

O e-mail deve ser único no sistema. A verificação deve considerar o registro atual em operações de edição.

### RN-03 — Data de Nascimento

A data de nascimento não pode ser uma data futura. O sistema deve rejeitar datas maiores que a data atual.

### RN-04 — Imutabilidade do CPF

Uma vez cadastrado, o CPF de uma pessoa não pode ser alterado. O campo deve ser exibido como somente leitura no formulário de edição.

---

## Fluxos de Erro Esperados

| Situação | Mensagem ao Usuário |
|---|---|
| Campo obrigatório vazio | "O campo [nome do campo] é obrigatório" |
| E-mail inválido | "Informe um endereço de e-mail válido" |
| CPF com formato inválido | "Informe um CPF no formato XXX.XXX.XXX-XX" |
| CPF com dígitos inválidos | "CPF inválido" |
| CPF já cadastrado | "Este CPF já está cadastrado no sistema" |
| E-mail já cadastrado | "Este e-mail já está cadastrado no sistema" |
| Data de nascimento futura | "A data de nascimento não pode ser uma data futura" |
| Registro não encontrado | "Pessoa não encontrada" |
| Erro interno do servidor | "Ocorreu um erro inesperado. Tente novamente." |

---

## Fora do Escopo

Os seguintes itens estão explicitamente fora do escopo desta especificação:

- Autenticação e autorização de usuários
- Paginação da listagem
- Busca/filtro de pessoas
- Soft delete (exclusão lógica)
- Upload de foto ou documentos
- Exportação de dados
