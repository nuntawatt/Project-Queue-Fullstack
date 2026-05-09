import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';

import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';

async function bootstrap() {
  // Create App
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  // ดึง ConfigService มาใช้งาน แทนการใช้ process.env ตรงๆ
  const configService = app.get(ConfigService);

  /*
    Trust Proxy
    Important when using:
    - Nginx
    - Cloudflare
    - Load Balancer
    - Kubernetes ingress
  */
  app.set('trust proxy', 1);

  /*
    Graceful shutdown
    เวลาปิด server:
      - docker stop
      - kubernetes scale down
    app จะ cleanup connection ก่อนปิด
  */
  app.enableShutdownHooks();

  // ตั้งค่า global prefix
  app.setGlobalPrefix('api');

  // ตั้งค่า versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ตั้งค่า web socket adapter
  app.useWebSocketAdapter(new WsAdapter(app));

  // helmet ช่วยเพิ่ม security header ป้องกัน attack หลายประเภท
  app.use(
    helmet({
      // CPS มันจะชอบชนกับ Swagger/dev tools
      // เลยปิดตอน dev ไว้ก่อน
      contentSecurityPolicy:
        configService.get<string>('NODE_ENV') === 'production'
          ? undefined
          : false,
    }),
  );

  // compression จะช่วยบีบอัด response ลง
  app.use(compression());

  // ตั้งค่า cors อนุญาติสิทธิ์เพื่อเข้าถึง
  app.enableCors({
    origin:
      configService
        .get<string>('CORS_ORIGIN')
        ?.split(',')
        .map((origin) => origin.trim()) ?? [],

    credentials: true,
  });

  // ตั้งค่า validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      // ตัด field ที่ไม่ได้ประกาศใน DTO ออก
      whitelist: true,
      // แปลง type อัตโนมัติ (เช่น "1" -> 1)
      transform: true,
      // ส่ง error ถ้ามี field ที่ไม่ได้ประกาศใน DTO
      forbidNonWhitelisted: true,
      // แปลง type อัตโนมัติ (เช่น "1" -> 1)
      transformOptions: {
        enableImplicitConversion: true,
      },
      // ซ่อนข้อมูลบางอย่างจาก error response เพื่อความปลอดภัย
      validationError: {
        target: false, // ซ่อนชื่อ class
        value: false, // ซ่อนค่าที่ไม่ถูกต้อง
      },
    }),
  );

  // ตรวจสอบว่า production มั้ย
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // ทำ swagger doc
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Queuely API')
      .setDescription('Job Queue & Worker Management System')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        'x-api-key',
      )
      .build();

    // สร้าง swagger document
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // จำ token ไว้
      },
    });

    logger.log(
      `Swagger Docs: http://localhost:${configService.get<number>(
        'PORT',
      )}/api/docs`,
    );
  }

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(`Application started`);
  logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  logger.log(`Port: ${port}`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
}

// handle bootstrap error
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
