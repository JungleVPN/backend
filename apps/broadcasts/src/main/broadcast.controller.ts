import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';

@Controller()
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  /** POST /broadcasts — create a new broadcast record */
  @Post()
  async create(@Body() body: { messageText: string }) {
    return this.broadcastService.create(body.messageText);
  }

  /** GET /broadcasts/:id — get broadcast by id */
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.broadcastService.getById(id);
  }

  /** PATCH /broadcasts/:id — update broadcast text */
  @Patch(':id')
  async updateText(@Param('id', ParseIntPipe) id: number, @Body() body: { messageText: string }) {
    return this.broadcastService.updateText(id, body.messageText);
  }

  /** DELETE /broadcasts/:id — delete broadcast and all its messages */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.broadcastService.delete(id);
    return { deleted: true };
  }

  /** GET /broadcasts/:id/messages — get all messages for a broadcast */
  @Get(':id/messages')
  async getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.broadcastService.getMessages(id);
  }

  /** POST /broadcasts/:id/messages — add a single sent message record */
  @Post(':id/messages')
  async addMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { telegramId: string; messageId: number },
  ) {
    return this.broadcastService.addMessage(id, body.telegramId, body.messageId);
  }

  /** POST /broadcasts/:id/messages/batch — add multiple sent message records */
  @Post(':id/messages/batch')
  async addMessages(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { messages: Array<{ telegramId: string; messageId: number }> },
  ) {
    return this.broadcastService.addMessages(id, body.messages);
  }
}
