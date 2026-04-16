import { BotContext } from '@bot/bot.types';
import { ProfileMenuService } from '@bot/navigation/features/profile/profile-menu.service';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class NavigateProfileCallback {
  constructor(readonly profileMenuService: ProfileMenuService) {}

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_to_profile', async (ctx) => {
      await this.profileMenuService.init(ctx);
      await ctx.answerCallbackQuery();
    });
  }
}
