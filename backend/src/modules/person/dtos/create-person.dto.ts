import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsCpf } from '../../../common/validators/cpf.validator';

export class CreatePersonDto {
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  @IsString()
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  nome!: string;

  @IsNotEmpty({ message: 'O campo e-mail é obrigatório' })
  @IsEmail({}, { message: 'Informe um endereço de e-mail válido' })
  email!: string;

  @IsNotEmpty({ message: 'O campo CPF é obrigatório' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'Informe um CPF no formato XXX.XXX.XXX-XX',
  })
  @IsCpf()
  cpf!: string;

  @IsNotEmpty({ message: 'O campo data de nascimento é obrigatório' })
  @IsDateString({}, { message: 'Informe uma data válida' })
  dataNascimento!: string;

  @IsNotEmpty({ message: 'O campo telefone é obrigatório' })
  @Matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: 'Informe o telefone no formato (XX) XXXXX-XXXX',
  })
  telefone!: string;
}
