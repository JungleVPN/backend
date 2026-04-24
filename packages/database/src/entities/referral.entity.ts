import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { bigintTransformer } from '../utils/transformers';

type ReferralStatus = 'FIRST_REWARD' | 'COMPLETED';

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
