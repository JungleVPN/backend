import { Payments } from '@workspace/types';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('yookassa_payments')
export class YookassaPayment {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, type: 'varchar' })
  userId: string | null;

  @Column({ type: 'int', nullable: true })
  amount: number | null;

  @Column({ type: 'varchar', default: 'RUB' })
  currency: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: Payments.PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  url: string | null;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
