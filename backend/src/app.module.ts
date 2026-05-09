import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { EventBusModule } from './gateways/event-bus.module';
import { JobsModule } from './jobs/jobs.module';
import { WorkersModule } from './workers/workers.module';
import { DlqModule } from './dlq/dlq.module';
import { MetricsModule } from './metrics/metrics.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './api-key/entities/api-key.entity';
import { JobHistory } from './jobs/entities/job-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [ApiKey, JobHistory],
        synchronize: config.get<string>('nodeEnv') !== 'production', // Auto-create tables in dev
      }),
    }),
    TypeOrmModule.forFeature([ApiKey, JobHistory]),
    RedisModule,
    EventBusModule,
    JobsModule,
    WorkersModule,
    DlqModule,
    MetricsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
