import { classToPlain, Exclude } from 'class-transformer';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// TODO: Figure out the testing incompatability bull
@Entity('users')
class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Index()
  @Column({ unique: true })
  email!: string;

  @Index()
  @Column({ unique: true })
  username!: string;

  @Exclude()
  @Column()
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
