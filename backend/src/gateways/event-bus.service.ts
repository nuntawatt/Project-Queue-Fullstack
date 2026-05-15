import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JobEvent } from '../common/types/job.types';

const CHANNEL = 'queuely:events';
type EventHandler = (event: JobEvent) => void;

@Injectable()
export class EventBusService implements OnModuleInit {
  private readonly logger = new Logger(EventBusService.name);
  private readonly handlers: EventHandler[] = [];

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    // 1. รับฟัง Event ทั้งหมดผ่าน Redis Pub/Sub แบบเรียลไทม์
    const sub = this.redis.getSubscriber();
    await sub.subscribe(CHANNEL);
    sub.on('message', (_, message) => {
      try {
        const event = JSON.parse(message) as JobEvent;
        // 2. ส่ง Event ที่ได้รับต่อไปยัง Handler ทั้งหมดที่ลงทะเบียนไว้ (เช่น WebSocket Gateway)
        this.handlers.forEach((h) => h(event));
      } catch (err) {
        this.logger.error('Failed to parse event', err);
      }
    });
    this.logger.log(`Subscribed to channel: ${CHANNEL}`);
  }

  /**
   * ส่ง Event ใหม่เข้าไปในระบบ
   */
  async publish(event: JobEvent): Promise<void> {
    await this.redis.getClient().publish(CHANNEL, JSON.stringify(event));
  }

  /**
   * ลงทะเบียนรับฟัง Event (ใช้โดย WebSocket Gateway เพื่อบรอดแคสต์ไปที่หน้า UI)
   */
  subscribe(handler: EventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) this.handlers.splice(index, 1);
    };
  }
}
