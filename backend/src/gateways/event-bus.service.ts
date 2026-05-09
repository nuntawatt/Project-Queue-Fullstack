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
    const sub = this.redis.getSubscriber();
    await sub.subscribe(CHANNEL);
    sub.on('message', (_, message) => {
      try {
        const event = JSON.parse(message) as JobEvent;
        this.handlers.forEach((h) => h(event));
      } catch (err) {
        this.logger.error('Failed to parse event', err);
      }
    });
    this.logger.log(`Subscribed to channel: ${CHANNEL}`);
  }

  async publish(event: JobEvent): Promise<void> {
    await this.redis.getClient().publish(CHANNEL, JSON.stringify(event));
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) this.handlers.splice(index, 1);
    };
  }
}
