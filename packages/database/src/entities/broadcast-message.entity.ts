import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Broadcast } from './broadcast.entity';

@Entity('broadcast_messages')
export class BroadcastMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Broadcast, { onDelete: 'CASCADE' })
  broadcast: Broadcast;

  @Column({ type: 'bigint' })
  telegramId: string;

  @Column({ type: 'int' })
  messageId: number;
}
