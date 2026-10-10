import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterService {
  private records = new Map<string, RateLimitRecord>();

  check(key: string, limit: number, windowMs: number): void {
    const now = Date.now();
    const current = this.records.get(key);

    if (!current || now > current.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (current.count >= limit) {
      const waitSeconds = Math.ceil((current.resetAt - now) / 1000);
      throw new HttpException(
        `Limite de tentativas excedido. Tente novamente em ${waitSeconds} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    current.count += 1;
  }

  reset(key: string): void {
    this.records.delete(key);
  }
}
