import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { EventBusService } from './event-bus.service';

@WebSocketGateway({ path: '/ws' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly eventBus: EventBusService) {}

  afterInit() {
    this.eventBus.subscribe((event) => {
      const payload = JSON.stringify(event);
      this.server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
      });
    });
    this.logger.log('WebSocket Gateway ready at /ws');
  }

  handleConnection() {
    this.logger.log('Client connected');
  }
  handleDisconnect() {
    this.logger.log('Client disconnected');
  }
}
