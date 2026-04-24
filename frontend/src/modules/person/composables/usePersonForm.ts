import { computed, reactive } from 'vue';
import type { CreatePersonPayload, Person, UpdatePersonPayload } from '../types/person.types';

type EditModeSource = boolean | (() => boolean);

function validarCpf(value: string): boolean {
  const cpf = value.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  const calcularDigito = (base: string, pesoInicial: number): number => {
    const soma = base
      .split('')
      .reduce((acc, d, i) => acc + parseInt(d, 10) * (pesoInicial - i), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(cpf.substring(0, 9), 10);
  if (d1 !== parseInt(cpf[9], 10)) return false;

  const d2 = calcularDigito(cpf.substring(0, 10), 11);
  return d2 === parseInt(cpf[10], 10);
}

export interface FormFields {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
}

type FormErrors = Record<keyof FormFields, string>;

function resolveIsEdit(isEditSource: EditModeSource): boolean {
  return typeof isEditSource === 'function' ? isEditSource() : isEditSource;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits.length === 0 ? '' : `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const restante = digits.slice(2);

  if (restante.length <= 4) {
    return `(${ddd}) ${restante}`;
  }

  if (restante.length <= 8) {
    return `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
  }

  return `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5, 9)}`;
}

export function usePersonForm(isEditSource: EditModeSource = false) {
  const fields = reactive<FormFields>({
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
  });

  const errors = reactive<FormErrors>({
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
  });

  function fill(person: Person): void {
    fields.nome = person.nome;
    fields.email = person.email;
    fields.cpf = person.cpf;
    fields.dataNascimento = person.dataNascimento;
    fields.telefone = person.telefone;
  }

  function reset(): void {
    fields.nome = '';
    fields.email = '';
    fields.cpf = '';
    fields.dataNascimento = '';
    fields.telefone = '';
    errors.nome = '';
    errors.email = '';
    errors.cpf = '';
    errors.dataNascimento = '';
    errors.telefone = '';
  }

  function validateField(field: keyof FormFields): boolean {
    errors[field] = '';
    const value = fields[field].trim();

    switch (field) {
      case 'nome':
        if (!value) {
          errors.nome = 'O campo nome é obrigatório';
          return false;
        }
        if (value.length < 3) {
          errors.nome = 'O nome deve ter no mínimo 3 caracteres';
          return false;
        }
        if (value.length > 100) {
          errors.nome = 'O nome deve ter no máximo 100 caracteres';
          return false;
        }
        break;

      case 'email':
        if (!value) {
          errors.email = 'O campo e-mail é obrigatório';
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Informe um endereço de e-mail válido';
          return false;
        }
        break;

      case 'cpf':
        if (!resolveIsEdit(isEditSource)) {
          fields.cpf = formatCpf(fields.cpf);

          if (!value) {
            errors.cpf = 'O campo CPF é obrigatório';
            return false;
          }
          if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
            errors.cpf = 'Informe um CPF no formato XXX.XXX.XXX-XX';
            return false;
          }
          if (!validarCpf(value)) {
            errors.cpf = 'CPF inválido';
            return false;
          }
        }
        break;

      case 'dataNascimento':
        if (!value) {
          errors.dataNascimento = 'O campo data de nascimento é obrigatório';
          return false;
        }
        if (new Date(value) > new Date()) {
          errors.dataNascimento = 'A data de nascimento não pode ser futura';
          return false;
        }
        break;

      case 'telefone':
        fields.telefone = formatTelefone(fields.telefone);

        if (!value) {
          errors.telefone = 'O campo telefone é obrigatório';
          return false;
        }
        if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(value)) {
          errors.telefone = 'Informe o telefone no formato (XX) XXXXX-XXXX';
          return false;
        }
        break;
    }

    return true;
  }

  function validate(): boolean {
    const fieldsToValidate: (keyof FormFields)[] = resolveIsEdit(isEditSource)
      ? ['nome', 'email', 'dataNascimento', 'telefone']
      : ['nome', 'email', 'cpf', 'dataNascimento', 'telefone'];
    return fieldsToValidate.map(validateField).every(Boolean);
  }

  function toCreatePayload(): CreatePersonPayload {
    return {
      nome: fields.nome.trim(),
      email: fields.email.trim(),
      cpf: formatCpf(fields.cpf.trim()),
      dataNascimento: fields.dataNascimento,
      telefone: formatTelefone(fields.telefone.trim()),
    };
  }

  function toUpdatePayload(): UpdatePersonPayload {
    return {
      nome: fields.nome.trim(),
      email: fields.email.trim(),
      dataNascimento: fields.dataNascimento,
      telefone: formatTelefone(fields.telefone.trim()),
    };
  }

  const isValid = computed(() => Object.values(errors).every((error) => error === ''));

  return {
    fields,
    errors,
    isValid,
    fill,
    reset,
    validateField,
    validate,
    toCreatePayload,
    toUpdatePayload,
  };
}
