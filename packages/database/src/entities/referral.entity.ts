import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

type ReferralStatus = 'FIRST_REWARD' | 'COMPLETED';

/** TypeORM returns bigint as string — this converts it back to number on read. */
const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: false, transformer: bigintTransformer })
  inviterId: number;

  @Column({ type: 'bigint', unique: true, transformer: bigintTransformer })
  invitedId: number;

  @Column({
    type: 'varchar',
    default: 'FIRST_REWARD',
  })
  status: ReferralStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
