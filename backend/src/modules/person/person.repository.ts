import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonDto } from './dtos/create-person.dto';
import { UpdatePersonDto } from './dtos/update-person.dto';
import { IPersonRepository } from './interfaces/person-repository.interface';
import { Person } from './person.entity';

@Injectable()
export class PersonRepository implements IPersonRepository {
  constructor(
    @InjectRepository(Person)
    private readonly repo: Repository<Person>,
  ) {}

  findAll(): Promise<Person[]> {
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  findById(id: string): Promise<Person | null> {
    return this.repo.findOneBy({ id });
  }

  findByCpf(cpf: string): Promise<Person | null> {
    return this.repo.findOneBy({ cpf });
  }

  findByEmail(email: string, excludeId?: string): Promise<Person | null> {
    const query = this.repo.createQueryBuilder('person').where('person.email = :email', { email });

    if (excludeId) {
      query.andWhere('person.id != :excludeId', { excludeId });
    }

    return query.getOne();
  }

  async create(data: CreatePersonDto): Promise<Person> {
    const person = this.repo.create(data);
    return this.repo.save(person);
  }

  async update(id: string, data: UpdatePersonDto): Promise<Person> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
