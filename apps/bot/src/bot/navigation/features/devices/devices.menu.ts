import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Base } from '@bot/navigation/menu.base';
import { mapDeviceLabel } from '@bot/utils/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserDevice } from '@shared/user.types';

@Injectable()
export class DevicesMenu extends Base {
  readonly menu = new Menu('devices-menu');
  private devices: UserDevice[] = JSON.parse(
    process.env.CLIENT_DEVICES || '["ios","android","macOS","windows"]',
  );

  constructor(
    readonly mainMenuService: MainMenuService,
    readonly subscriptionMsgService: SubscriptionMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => SubscriptionMenu))
    readonly subscriptionMenu: SubscriptionMenu,
  ) {
    super();

    this.menu.dynamic((_, range) => {
      this.devices.forEach((device, i) => {
        range.text(mapDeviceLabel(device), async (ctx) => await this.selectDevice(ctx, device));
        if (i % 2 === 1) range.row();
      });

      range.row();
      range.text({ text: (ctx) => ctx.t('back-button-label') }, async (ctx) => {
        await this.mainMenuService.init(ctx, this.mainMenu.menu);
      });
    });
  }

  private async selectDevice(ctx: BotContext, device: UserDevice) {
    ctx.session.selectedDevice = device;
    // await this.remnaService.init(ctx);
    await this.subscriptionMsgService.init(ctx, this.subscriptionMenu.menu);
  }
}
