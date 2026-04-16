export type WebHookEvent =
  | 'user.expired'
  | 'user.expires_in_24_hours'
  | 'user.expires_in_48_hours'
  | 'user.expires_in_72_hours'
  | 'user.expired_24_hours_ago'
  | 'user.not_connected'
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';
