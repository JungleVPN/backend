import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { YooKassaErr } from './yookassa.errors';

/**
 * HTTP methods used by the YooKassa API endpoints we call.
 * (No PUT/DELETE in this API surface.)
 */
type HttpMethod = 'GET' | 'POST';

/**
 * Trimmed port of @webzaytsev/yookassa-ts-sdk's Connector, adapted to NestJS.
 *
 * Deliberately omitted from upstream:
 * - OAuth/bearer token flow
 * - Rate limiting (axios-rate-limit)
 * - HTTP(S) proxy agent
 * - Debug logger
 * - Instance caching
 *
 * Kept:
 * - Basic auth (shop_id:secret_key)
 * - Idempotence-Key header (auto-generated if not provided)
 * - Retry loop with exponential backoff on 5xx / 429 / network errors
 * - YooKassaErr for API-level errors
 */
@Injectable()
export class YooKassaConnector {
  private readonly logger = new Logger(YooKassaConnector.name);
  private readonly http: AxiosInstance;
  private readonly maxRetries: number;
  private readonly baseRetryDelayMs: number;

  constructor() {
    this.http = axios.create({
      baseURL: process.env.YOOKASSA_URL,
      timeout: Number(process.env.YOOKASSA_TIMEOUT_MS ?? 30_000),
      // Let us handle error responses ourselves so we can throw YooKassaErr.
      validateStatus: () => true,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: process.env.YOOKASSA_SHOP_ID || '',
        password: process.env.YOOKASSA_API_KEY || '',
      },
    });

    this.maxRetries = Number(process.env.YOOKASSA_MAX_RETRIES ?? 3);
    this.baseRetryDelayMs = Number(process.env.YOOKASSA_RETRY_DELAY_MS ?? 1_000);
  }

  /**
   * Execute an HTTP request against the YooKassa API.
   *
   * @param method       HTTP method
   * @param path         Path relative to `YOOKASSA_URL`, e.g. `/` for create, `/:id` for get
   * @param body         Request body (for POST)
   * @param idempotenceKey Idempotence-Key header. Auto-generated (uuid v4) when omitted for POST.
   */
  async request<TResponse, TBody = unknown>(
    method: HttpMethod,
    path: string,
    body?: TBody,
    idempotenceKey?: string,
  ): Promise<TResponse> {
    const headers: Record<string, string> = {};
    if (method === 'POST') {
      headers['Idempotence-Key'] = idempotenceKey ?? crypto.randomUUID();
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.http.request<TResponse | YooKassaApiError>({
          method,
          url: path,
          data: body,
          headers,
        });

        if (response.status >= 200 && response.status < 300) {
          return response.data as TResponse;
        }

        // 4xx (except 429) — client errors, not retryable.
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw this.toYooKassaErr(response.data, response.status);
        }

        // 5xx / 429 — retry.
        lastError = this.toYooKassaErr(response.data, response.status);
      } catch (err) {
        if (err instanceof YooKassaErr) {
          // 4xx mapped above — don't retry.
          if (err.httpStatus && err.httpStatus >= 400 && err.httpStatus < 500 && err.httpStatus !== 429) {
            throw err;
          }
          lastError = err;
        } else if (this.isRetryableNetworkError(err)) {
          lastError = err;
        } else {
          throw err;
        }
      }

      if (attempt < this.maxRetries) {
        const delay = this.baseRetryDelayMs * 2 ** attempt;
        this.logger.warn(
          `YooKassa ${method} ${path} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms`,
        );
        await this.sleep(delay);
      }
    }

    throw lastError ?? new Error('YooKassa request failed without a captured error');
  }

  private toYooKassaErr(data: unknown, httpStatus: number): YooKassaErr {
    if (isYooKassaApiError(data)) {
      return new YooKassaErr(data.id, data.code, data.description, data.parameter, httpStatus);
    }
    return new YooKassaErr(
      'unknown',
      `http_${httpStatus}`,
      typeof data === 'string' ? data : JSON.stringify(data),
      undefined,
      httpStatus,
    );
  }

  private isRetryableNetworkError(err: unknown): boolean {
    if (!axios.isAxiosError(err)) return false;
    const axiosErr = err as AxiosError;
    // No response → network error (ECONNRESET, ETIMEDOUT, DNS, etc.)
    if (!axiosErr.response) return true;
    const status = axiosErr.response.status;
    return status >= 500 || status === 429;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Shape of YooKassa's error response body. */
interface YooKassaApiError {
  type: 'error';
  id: string;
  code: string;
  description: string;
  parameter?: string;
}

function isYooKassaApiError(value: unknown): value is YooKassaApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as YooKassaApiError).type === 'error' &&
    typeof (value as YooKassaApiError).id === 'string' &&
    typeof (value as YooKassaApiError).code === 'string'
  );
}
