import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, length: 14 })
  cpf!: string;

  @Column({ type: 'date', name: 'data_nascimento' })
  dataNascimento!: string;

  @Column({ length: 15 })
  telefone!: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
