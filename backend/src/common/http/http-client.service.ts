import { Injectable, Logger } from '@nestjs/common';

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  async post<T = any>(
    url: string,
    data: any,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeout ?? 15000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    } catch (error) {
      this.logger.error(`HTTP POST to ${url} failed: ${(error as Error).message}`);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
