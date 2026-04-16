import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DonateMenu extends Base implements OnModuleInit {
  menu = new Menu('donate-menu');

  constructor(
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    readonly mainMenuService: MainMenuService,
  ) {
    super();
  }

  onModuleInit() {
    this.menu
      .url(
        (ctx) => ctx.t('donate-button-label'),
        process.env.YOOKASSA_DONATE_LINK || 'https://yookassa.ru/',
      )
      .row()
      .switchInline((ctx) => ctx.t('invite-button-label'))
      .row()
      .url(
        (ctx) => ctx.t('chanel-button-label'),
        process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/in_the_jungle',
      )
      .row()
      .text(
        (ctx) => ctx.t('back-button-label'),
        async (ctx) => await this.mainMenuService.init(ctx, this.mainMenu.menu),
      );
  }
}
