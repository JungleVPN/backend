import { BotContext } from '@bot/bot.types';
import { Menu as GrammyMenu, type MenuOptions } from '@grammyjs/menu';

export class Menu extends GrammyMenu<BotContext> {
  constructor(id: string, options?: Partial<MenuOptions<BotContext>>) {
    super(id, {
      onMenuOutdated: async (ctx) => {
        try {
          await ctx.reply(ctx.t('error-menu-outdated'));
        } catch (e) {
          console.error('Failed to send outdated menu message:', e);
        }
      },
      ...options,
    });
  }
}
