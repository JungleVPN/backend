import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class ReferralMenuService extends Base {
  constructor(
    private readonly remnaService: RemnaService,
    private readonly localService: LocalisationService,
  ) {
    super();
  }

  async init(ctx: BotContext, menu: Menu, deleteOldMsg?: boolean) {
    const user = await this.remnaService.getUserByTgId(ctx.from?.id || 0);
    ctx.session.userId = user?.[0].uuid;
    const locale = user?.[0].description || process.env.DEFAULT_LOCALE || 'ru';

    const content = this.localService.i18n.t(locale, 'referral-page-text', {
      inviterStartBonusInDays: process.env.INVITER_START_BONUS_IN_DAYS || '0',
      inviterPaidBonusInDays: process.env.INVITER_PAID_BONUS_IN_DAYS || '0',
    });

    await this.render(ctx, content, menu, deleteOldMsg);
  }
}
