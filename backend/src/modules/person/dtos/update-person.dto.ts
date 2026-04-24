import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';

// CPF é omitido explicitamente — conforme RN-04 (CPF é imutável após cadastro)
export class UpdatePersonDto extends PartialType(
  OmitType(CreatePersonDto, ['cpf'] as const),
) {}
