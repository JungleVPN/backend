import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Broadcast, BroadcastMessage } from '@workspace/database';
import { Repository } from 'typeorm';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    @InjectRepository(Broadcast)
    private readonly broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastMessage)
    private readonly broadcastMessageRepo: Repository<BroadcastMessage>,
  ) {}

  async create(messageText: string): Promise<Broadcast> {
    const broadcast = this.broadcastRepo.create({ messageText });
    const saved = await this.broadcastRepo.save(broadcast);
    this.logger.log(`Created broadcast ${saved.id}`);
    return saved;
  }

  async getById(id: number): Promise<Broadcast> {
    const broadcast = await this.broadcastRepo.findOne({ where: { id } });
    if (!broadcast) {
      throw new NotFoundException(`Broadcast ${id} not found`);
    }
    return broadcast;
  }

  async updateText(id: number, messageText: string): Promise<Broadcast> {
    const broadcast = await this.getById(id);
    broadcast.messageText = messageText;
    return this.broadcastRepo.save(broadcast);
  }

  async delete(id: number): Promise<void> {
    // Messages are CASCADE-deleted via the entity relation
    await this.broadcastMessageRepo.delete({ broadcast: { id } });
    await this.broadcastRepo.delete({ id });
    this.logger.log(`Deleted broadcast ${id}`);
  }

  async getMessages(broadcastId: number): Promise<BroadcastMessage[]> {
    return this.broadcastMessageRepo.find({
      where: { broadcast: { id: broadcastId } },
    });
  }

  async addMessage(
    broadcastId: number,
    telegramId: string,
    messageId: number,
  ): Promise<BroadcastMessage> {
    const broadcast = await this.getById(broadcastId);
    const message = this.broadcastMessageRepo.create({
      broadcast,
      telegramId,
      messageId,
    });
    return this.broadcastMessageRepo.save(message);
  }

  async addMessages(
    broadcastId: number,
    messages: Array<{ telegramId: string; messageId: number }>,
  ): Promise<BroadcastMessage[]> {
    const broadcast = await this.getById(broadcastId);
    const entities = messages.map((m) =>
      this.broadcastMessageRepo.create({
        broadcast,
        telegramId: m.telegramId,
        messageId: m.messageId,
      }),
    );
    return this.broadcastMessageRepo.save(entities);
  }
}
