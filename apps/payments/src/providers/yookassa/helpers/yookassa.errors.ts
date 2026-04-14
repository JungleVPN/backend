/**
 * Error thrown when the YooKassa API returns a non-2xx response with an error body.
 *
 * Shape follows YooKassa's error response:
 * @see https://yookassa.ru/developers/using-api/interaction-format#api-errors
 */
export class YooKassaErr extends Error {
  readonly type = 'error' as const;

  constructor(
    /** YooKassa error identifier (uuid). */
    readonly id: string,
    /** Machine-readable error code, e.g. `invalid_request`, `not_found`. */
    readonly code: string,
    /** Human-readable description. */
    readonly description: string,
    /** Parameter name that caused the error (if applicable). */
    readonly parameter?: string,
    /** HTTP status code from the response. */
    readonly httpStatus?: number,
  ) {
    super(`[${code}] ${description}${parameter ? ` (parameter: ${parameter})` : ''}`);
    this.name = 'YooKassaErr';
  }
}
