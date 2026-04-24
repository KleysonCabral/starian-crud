import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PERSON_REPOSITORY } from './interfaces/person-repository.interface';
import { PersonController } from './person.controller';
import { Person } from './person.entity';
import { PersonRepository } from './person.repository';
import { PersonService } from './person.service';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PersonController],
  providers: [
    PersonService,
    {
      provide: PERSON_REPOSITORY,
      useClass: PersonRepository,
    },
  ],
})
export class PersonModule {}
