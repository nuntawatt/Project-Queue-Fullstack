import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('job_history')
export class JobHistory {
  @PrimaryColumn()
  id!: string;

  @Column()
  type!: string;

  @Column()
  priority!: string;

  @Column()
  status!: string;

  @Column('jsonb')
  payload!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
