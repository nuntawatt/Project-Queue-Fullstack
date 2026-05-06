import { Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventBusService, EventsGateway],
  exports: [EventBusService],
})
export class EventBusModule {}
