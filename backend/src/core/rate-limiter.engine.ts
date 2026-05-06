import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterEngine {
  private readonly logger = new Logger(RateLimiterEngine.name);
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.windowMs = this.config.get<number>('rateLimit.windowMs')!;
    this.maxRequests = this.config.get<number>('rateLimit.maxRequests')!;
  }

  async consume(clientId: string): Promise<RateLimitResult> {
    const key = `queuely:rate:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const pipeline = this.redis.getClient().pipeline();
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, this.windowMs);
    const results = await pipeline.exec();

    const count = (results?.[2]?.[1] as number) ?? 0;
    const allowed = count <= this.maxRequests;

    if (!allowed)
      this.logger.warn(`Rate limit exceeded — clientId=${clientId}`);

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - count),
      resetAt: now + this.windowMs,
    };
  }
}
