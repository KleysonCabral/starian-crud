import { Inject, Injectable } from '@nestjs/common';
import { CpfAlreadyExistsException } from '../../common/exceptions/cpf-already-exists.exception';
import { EmailAlreadyExistsException } from '../../common/exceptions/email-already-exists.exception';
import { PersonNotFoundException } from '../../common/exceptions/person-not-found.exception';
import { CreatePersonDto } from './dtos/create-person.dto';
import { UpdatePersonDto } from './dtos/update-person.dto';
import type { IPersonRepository } from './interfaces/person-repository.interface';
import { PERSON_REPOSITORY } from './interfaces/person-repository.interface';
import { Person } from './person.entity';

@Injectable()
export class PersonService {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: IPersonRepository,
  ) {}

  findAll(): Promise<Person[]> {
    return this.personRepository.findAll();
  }

  async findById(id: string): Promise<Person> {
    const person = await this.personRepository.findById(id);

    if (!person) {
      throw new PersonNotFoundException(id);
    }

    return person;
  }

  async create(dto: CreatePersonDto): Promise<Person> {
    const cpfEmUso = await this.personRepository.findByCpf(dto.cpf);
    if (cpfEmUso) {
      throw new CpfAlreadyExistsException(dto.cpf);
    }

    const emailEmUso = await this.personRepository.findByEmail(dto.email);
    if (emailEmUso) {
      throw new EmailAlreadyExistsException(dto.email);
    }

    return this.personRepository.create(dto);
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    await this.findById(id);

    if (dto.email) {
      const emailEmUso = await this.personRepository.findByEmail(dto.email, id);
      if (emailEmUso) {
        throw new EmailAlreadyExistsException(dto.email);
      }
    }

    return this.personRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.personRepository.delete(id);
  }
}
