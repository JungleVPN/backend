import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { isValidUsername } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MainMenuService extends Base {
  async init(ctx: BotContext, menu: Menu, deleteOldMsg?: boolean) {
    const username = isValidUsername(ctx.from?.username)
      ? ctx.from?.username
      : ctx.t('dear-friend');

    const content = ctx.t('main-text', {
      username: username!,
    });

    await this.render(ctx, content, menu, deleteOldMsg);
  }
}
