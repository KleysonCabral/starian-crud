export class EmailAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`E-mail "${email}" já está cadastrado no sistema`);
    this.name = 'EmailAlreadyExistsException';
  }
}
