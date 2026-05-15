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

  /**
   * ตรวจสอบว่า Client นี้เรียก API เกินลิมิตหรือไม่
   * ใช้ Algorithm แบบ Sliding Window ผ่าน Redis Sorted Set
   */
  async consume(clientId: string): Promise<RateLimitResult> {
    const key = `queuely:rate:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // ใช้ Redis Pipeline เพื่อส่งหลายคำสั่งพร้อมกัน รีดประสิทธิภาพสูงสุด
    const pipeline = this.redis.getClient().pipeline();
    // 1. ลบประวัติคำขอที่เก่ากว่าหน้าต่างเวลา (Window) ที่ตั้งไว้ออกไป
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    // 2. บันทึกคำขอปัจจุบันลงไป โดยใช้ Timestamp เป็น Score
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    // 3. นับจำนวนคำขอที่เหลืออยู่ในหน้าต่างเวลาปัจจุบัน
    pipeline.zcard(key);
    // 4. ต่ออายุ Key เท่ากับระยะเวลาของหน้าต่าง เพื่อให้ลบตัวเองอัตโนมัติ
    pipeline.pexpire(key, this.windowMs);
    const results = await pipeline.exec();

    // ผลลัพธ์จากการนับ (zcard) จะอยู่ที่ index 2
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
