import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCpf', async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    const cpf = value.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;

    // Rejeita sequências homogêneas (ex: 111.111.111-11)
    if (/^(\d)\1+$/.test(cpf)) return false;

    return this.validarDigitos(cpf);
  }

  private validarDigitos(cpf: string): boolean {
    const calcularDigito = (base: string, pesoInicial: number): number => {
      const soma = base
        .split('')
        .reduce((acc, digito, index) => acc + parseInt(digito) * (pesoInicial - index), 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiroDigito = calcularDigito(cpf.substring(0, 9), 10);
    if (primeiroDigito !== parseInt(cpf[9])) return false;

    const segundoDigito = calcularDigito(cpf.substring(0, 10), 11);
    return segundoDigito === parseInt(cpf[10]);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'CPF inválido';
  }
}

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
}
