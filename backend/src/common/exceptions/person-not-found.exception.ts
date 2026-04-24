export class PersonNotFoundException extends Error {
  constructor(id: string) {
    super(`Pessoa com id "${id}" não encontrada`);
    this.name = 'PersonNotFoundException';
  }
}
