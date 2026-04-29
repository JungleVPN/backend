import { BotContext } from '@bot/bot.types';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { SavedMethodDto } from '@workspace/types';

@Injectable()
export class ProfileMenuService extends Base {
  private readonly logger = new Logger(ProfileMenuService.name);

  constructor(
    @Inject(forwardRef(() => ProfileMenu))
    readonly profileMenu: ProfileMenu,
    readonly paymentsService: PaymentsService,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const userId = ctx.session.userId;

    const activeMethod = userId ? await this.resolveActiveMethod(String(userId)) : null;

    // Populate session BEFORE render so the profile menu's dynamic range can
    // decide whether to show the "delete saved method" button.
    ctx.session.activeSavedMethodId = activeMethod?.id;

    const activeMethodLine = activeMethod
      ? ctx.t('profile-active-method-text', { label: this.formatMethodLabel(activeMethod) })
      : ctx.t('profile-no-active-method-text');

    await this.render(
      ctx,
      ctx.t('profile-text', { activeMethod: activeMethodLine }),
      this.profileMenu.menu,
    );
  }

  /**
   * Handles the profile menu's "delete saved method" button.
   *
   * Reads the method id from session (populated by `init`), calls the backend
   * to hard-delete it, then re-renders the profile so the UI reflects the new
   * "no active method" state.
   */
  async deleteActiveMethod(ctx: BotContext): Promise<void> {
    const telegramId = ctx.from?.id;
    const methodId = ctx.session.activeSavedMethodId;
    const userId = ctx.session.userId;

    if (!userId || !methodId) {
      await ctx.answerCallbackQuery({ text: ctx.t('profile-delete-method-error') });
      return;
    }

    const { status } = await this.paymentsService.deleteSavedMethod(userId, methodId);
    if (status !== 200) {
      await ctx.answerCallbackQuery({ text: ctx.t('profile-delete-method-error') });
      this.logger.warn(`Failed to delete saved method ${methodId} for tg=${telegramId}`);
      return;
    }

    ctx.session.activeSavedMethodId = undefined;
    await ctx.answerCallbackQuery({ text: ctx.t('profile-delete-method-success') });
    await this.init(ctx);
  }

  /** Fetches the most recent active saved method for a user, or `null`. */
  private async resolveActiveMethod(userId: string): Promise<SavedMethodDto | null> {
    const methods = await this.paymentsService.getSavedMethods(userId);
    return methods.data.find((m) => m.isActive) ?? null;
  }

  /**
   * Produces a user-friendly label for a saved payment method.
   *
   * Preference order:
   *   1. Card brand + last-4 (e.g. "Visa **** 4242")
   *   2. Any `title` the provider gave us
   *   3. The raw `paymentMethodType` (last-resort fallback)
   */
  private formatMethodLabel(method: SavedMethodDto): string {
    const { card, title, paymentMethodType } = method;

    if (card?.last4) {
      const brand = card.cardType ? `${card.cardType} ` : '';
      return `${brand}**** ${card.last4}`.trim();
    }

    if (title) return title;

    return paymentMethodType;
  }
}
