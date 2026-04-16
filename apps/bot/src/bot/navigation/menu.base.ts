import { User as GrammyUser } from '@grammyjs/types/manage';
import { Injectable } from '@nestjs/common';
import { Context } from 'grammy';

@Injectable()
export abstract class Base {
  protected async render(ctx: Context, text: string, reply_markup: any, deleteOldMsg = false) {
    const options = {
      parse_mode: 'HTML' as const,
      link_preview_options: { is_disabled: true },
      reply_markup,
    };

    const edit = async () => ctx.editMessageText(text, options);
    const send = async () => ctx.reply(text, options);

    if (deleteOldMsg) {
      try {
        await ctx.deleteMessage();
        return await send();
      } catch {}
    }

    try {
      return await edit();
    } catch {
      return await send();
    }
  }

  protected validateUser(user: GrammyUser | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }
}
