import { BotContext } from '@bot/bot.types';
import { BroadcastBase } from '@bot/commands/broadcast/broadcast.base';
import { safeEditMessage, safeEditMessageCaption } from '@bot/utils/utils';
import {
  BroadcastDto,
  BroadcastMessageDto,
  BroadcastsService,
} from '@broadcasts/broadcasts.service';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class BroadcastEditCommand extends BroadcastBase {
  constructor(
    readonly remnaService: RemnaService,
    readonly broadcastsService: BroadcastsService,
  ) {
    super(remnaService, broadcastsService);
  }

  register(bot: Bot<BotContext>) {
    bot.command('editmsg', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) return;

      const message = ctx.message?.text;
      const entities = ctx.message?.entities;
      if (!message) return;

      await ctx.reply('Starting editing...');

      const parseResult = this.parseBroadcastId(message, 'editmsg');
      if ('error' in parseResult) {
        await ctx.reply(parseResult.error, { parse_mode: 'HTML' });
        return;
      }

      const textToSend = this.parseMessageText(message, entities, '/editmsg');

      if (!textToSend || textToSend.startsWith('/start')) {
        await ctx.reply('No message text provided.');
        return;
      }

      const result = await this.fetchBroadcastWithMessages(ctx, parseResult.broadcastId);
      if (!result) return;

      const { broadcast, messages } = result;

      await this.editBroadcastMessages(bot, messages, textToSend);

      // Update the broadcast text via backend
      const updated = await this.broadcastsService.updateText(broadcast.id, textToSend);

      const errorMessagesText = this.mapErrorMessages(this.errorMessages);
      const reply = this.getBroadcastMessage(updated, errorMessagesText);
      await ctx.reply(reply, { parse_mode: 'HTML' });
      this.resetState();
    });
  }

  private async editBroadcastMessages(
    bot: Bot<BotContext>,
    messages: BroadcastMessageDto[],
    textToEdit: string,
  ) {
    await this.processBatch(messages, async (msg) => {
      // Try editing as caption first (for photo messages)
      let result = await safeEditMessageCaption(bot, msg.telegramId, msg.messageId, textToEdit);

      // If caption edit fails (likely text-only message), try editing as text
      if (result !== true && 'error_code' in result) {
        if (result.error_code === 400) {
          result = await safeEditMessage(bot, msg.telegramId, msg.messageId, textToEdit);
        }
      }

      if (result !== true && 'error_code' in result) {
        this.errorMessages.push(`${result.description}`);
        throw new Error(result.description);
      }
    });
  }

  private getBroadcastMessage(broadcast: BroadcastDto, errorMessages?: string | null): string {
    return `Message edited
Broadcast ID: ${broadcast.id}
Success: ${this.successCount}
Failed: ${this.failureCount}

To edit:
<blockquote>
<code>/editmsg ${broadcast.id}
${broadcast.messageText}</code>
</blockquote>

To delete:
<blockquote>
<code>/deletemsg ${broadcast.id}</code>
</blockquote>

<blockquote expandable>
${errorMessages ? `<b>Errors:</b>\n${errorMessages}` : 'No errors.'}
</blockquote>
`;
  }
}
