export class CpfAlreadyExistsException extends Error {
  constructor(cpf: string) {
    super(`CPF "${cpf}" já está cadastrado no sistema`);
    this.name = 'CpfAlreadyExistsException';
  }
}
