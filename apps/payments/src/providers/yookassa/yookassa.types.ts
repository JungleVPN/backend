/** Response of `POST /payments/yookassa/create-session`. */
export interface YookassaSessionResponse {
  readonly id: string;
  readonly url: string;
}
