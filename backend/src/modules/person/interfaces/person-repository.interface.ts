import { Person } from '../person.entity';
import { CreatePersonDto } from '../dtos/create-person.dto';
import { UpdatePersonDto } from '../dtos/update-person.dto';

export interface IPersonRepository {
  findAll(): Promise<Person[]>;
  findById(id: string): Promise<Person | null>;
  findByCpf(cpf: string): Promise<Person | null>;
  findByEmail(email: string, excludeId?: string): Promise<Person | null>;
  create(data: CreatePersonDto): Promise<Person>;
  update(id: string, data: UpdatePersonDto): Promise<Person>;
  delete(id: string): Promise<void>;
}

export const PERSON_REPOSITORY = Symbol('IPersonRepository');
