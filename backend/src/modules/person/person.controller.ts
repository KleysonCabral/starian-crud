import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePersonDto } from './dtos/create-person.dto';
import { UpdatePersonDto } from './dtos/update-person.dto';
import { Person } from './person.entity';
import { PersonService } from './person.service';

@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Person> {
    return this.personService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePersonDto): Promise<Person> {
    return this.personService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonDto): Promise<Person> {
    return this.personService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.personService.delete(id);
  }
}
