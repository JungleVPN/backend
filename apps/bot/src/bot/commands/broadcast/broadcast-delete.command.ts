import { BotContext } from '@bot/bot.types';
import { BroadcastBase } from '@bot/commands/broadcast/broadcast.base';
import { BroadcastMessageDto, BroadcastsService } from '@broadcasts/broadcasts.service';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class BroadcastDeleteCommand extends BroadcastBase {
  constructor(
    readonly remnaService: RemnaService,
    readonly broadcastsService: BroadcastsService,
  ) {
    super(remnaService, broadcastsService);
  }

  register(bot: Bot<BotContext>) {
    bot.command('deletemsg', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) return;

      const message = ctx.message?.text;
      if (!message) return;

      // Parse broadcast ID
      const parseResult = this.parseBroadcastId(message, 'deletemsg');
      if ('error' in parseResult) {
        await ctx.reply(parseResult.error, { parse_mode: 'HTML' });
        return;
      }

      // Fetch broadcast and messages
      const result = await this.fetchBroadcastWithMessages(ctx, parseResult.broadcastId);
      if (!result) return;

      const { broadcast, messages } = result;

      await this.deleteBroadcastMessages(bot, messages);

      // Delete the broadcast record via backend
      await this.broadcastsService.delete(broadcast.id);

      const errorMessagesText = this.mapErrorMessages(this.errorMessages);

      await ctx.reply(
        `Delete message complete!

Broadcast ID: ${broadcast.id}
Deleted: ${this.successCount}
Failed: ${this.failureCount}

<blockquote expandable>
${errorMessagesText ? `<b>Errors:</b>\n${errorMessagesText}` : 'No errors.'}
</blockquote>
`,
        {
          parse_mode: 'HTML',
        },
      );
      this.resetState();
    });
  }

  private async deleteBroadcastMessages(bot: Bot<BotContext>, messages: BroadcastMessageDto[]) {
    await this.processBatch(messages, async (msg) => {
      await bot.api.deleteMessage(Number(msg.telegramId), msg.messageId);
    });
  }
}
