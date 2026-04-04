export const REFERRALS_EVENTS = {
  REWARDED: 'user.rewarded',
} as const;

export interface ReferralRewardedEvent {
  telegramId: number | null;
  isNewUser: boolean;
}
