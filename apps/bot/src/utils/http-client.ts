import * as http from 'node:http';
import process from 'node:process';
import axios, { AxiosInstance } from 'axios';

/**
 * Creates an axios instance configured to avoid stale keep-alive connections.
 *
 * Problem: Node.js HTTP keep-alive reuses TCP sockets. When a backend service
 * restarts (e.g., turbo dev watch mode), the socket dies but axios still tries
 * to write to it → "socket hang up" → all subsequent requests fail.
 *
 * Solution: Use an HTTP agent with short keepAlive timeout and freeSocket timeout
 * so dead sockets are detected and discarded quickly.
 */
export function createBackendClient(baseURL: string): AxiosInstance {
  const agent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    // Drop idle sockets after 5s — if the backend restarts,
    // new requests will open a fresh connection.
    timeout: 10_000,
  });

  return axios.create({
    baseURL,
    validateStatus: () => true,
    httpAgent: agent,
    headers: {
      'Content-Type': 'application/json',
      'x-service-secret': process.env.INTER_SERVICE_SECRET,
    },
    // Per-request timeout so we never hang indefinitely
    timeout: 5_000,
  });
}
