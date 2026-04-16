import { BotContext } from '@bot/bot.types';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class NavigateDevicesCallback {
  constructor(readonly devicesMenu: DevicesMenu) {}

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_devices', async (ctx) => {
      await ctx.editMessageText(ctx.t('devices-text'), {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: this.devicesMenu.menu,
      });
      await ctx.answerCallbackQuery();
    });
  }
}
