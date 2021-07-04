import { classToPlain, Exclude } from 'class-transformer';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: string;

  @Index()
  @Column({ unique: true, type: 'char varying' })
  email!: string;

  @Index()
  @Column({ unique: true, type: 'char varying' })
  username!: string;

  @Exclude()
  @Column({ type: 'char varying' })
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): Record<string, any> {
    return classToPlain(this);
  }
}

export default User;

// TODO: Study indexing
// TODO: Study migrations
