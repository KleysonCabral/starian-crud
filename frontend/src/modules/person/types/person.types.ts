export interface Person {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreatePersonPayload {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
}

export interface UpdatePersonPayload {
  nome?: string;
  email?: string;
  dataNascimento?: string;
  telefone?: string;
}
