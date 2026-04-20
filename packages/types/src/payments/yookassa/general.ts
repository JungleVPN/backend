/**
 * YooKassa — general primitives shared by every resource type.
 *
 * Mirrored from `@webzaytsev/yookassa-ts-sdk` (MIT, WEBzaytsev)
 * so we can use canonical YooKassa types without taking a runtime dependency.
 */

/**
 * Supported locales for YooKassa interface
 * @see https://yookassa.ru/developers/api#create_payment_confirmation_locale
 */
export enum LocaleEnum {
  /** Russian */
  ru_RU = 'ru_RU',
  /** English */
  en_US = 'en_US',
}

/**
 * Supported currencies in ISO-4217 format.
 * @see https://yookassa.ru/developers/api#payment_object_amount_currency
 */
export enum CurrencyEnum {
  /** Российский рубль */
  RUB = 'RUB',
  /** Евро */
  EUR = 'EUR',
  /** Доллар США */
  USD = 'USD',
  /** Казахстанский тенге */
  KZT = 'KZT',
  /** Белорусский рубль */
  BYN = 'BYN',
  /** Украинская гривна */
  UAH = 'UAH',
  /** Узбекский сум */
  UZS = 'UZS',
}

/**
 * Любые дополнительные данные, которые нужны вам для работы.
 *
 * Передаются в виде набора пар «ключ-значение» и возвращаются в ответе от ЮKassa.
 *
 * **Ограничения:**
 * - максимум 16 ключей
 * - имя ключа не больше 32 символов
 * - значение ключа не больше 512 символов
 * - тип данных — строка в формате UTF-8
 *
 * @see https://yookassa.ru/developers/api#payment_object_metadata
 */
export interface Metadata {
  telegramId?: number | null;
  userId?: string | null;
  email?: string | null;
  selectedPeriod: number;
  // [key: string]: string | number | boolean | null;
}

/**
 * Сумма платежа. Иногда партнеры ЮKassa берут с пользователя дополнительную комиссию, которая не входит в эту сумму.
 */
export interface IAmount {
  /**
   * Сумма в выбранной валюте.
   *
   * Всегда дробное значение. Разделитель дробной части — точка, разделитель тысяч отсутствует. Количество знаков после точки зависит от выбранной валюты. Пример: `1000.00`.
   */
  value: string;
  /** Трехбуквенный код валюты в формате ISO-4217. Пример: `RUB`. Должен соответствовать валюте субаккаунта (recipient.gateway_id), если вы разделяете потоки платежей, и валюте аккаунта (shopId в личном кабинете), если не разделяете. */
  currency: CurrencyEnum | string;
}
