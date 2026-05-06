import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import * as dotenv from 'dotenv';

// dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // ควบคุมระดับการ log ตามความต้องการ
  });

  app.setGlobalPrefix('api');

  // Global validation pipe configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ตัด Field ที่ไม่ได้กำหนดใน DTO ออก
      forbidNonWhitelisted: true, // ปฏิเสธคำข้าที่มี Field ที่ไม่ได้กำหนดใน DTO
      transform: true, // auto-transform payloads ตาม DTO type
      transformOptions: {
        enableImplicitConversion: true, // แปลง string -> number/boolean อัตโนมัติ
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;

  // Swagger configuration
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestJS Queuely API')
      .setDescription('API documentation for Queuely')
      .setVersion('1.0')
      .addServer(`http://localhost:${port}`, 'Development server')
      .addServer(`${process.env.API_URL}:${port}`, 'Production server')
      .addServer(`${process.env.API_URL}`, 'Production server (custom domain)')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token', // name key สำหรับการอ้างอิงใน @ApiBearerAuth()
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // จำ token ไว้ใน UI หลังจากรีเฟรชหน้า
      },
    });

    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }

  // Graceful shutdown handling
  // process.on('SIGTERM', async () => {
  //   logger.log('SIGTERM received, shutting down gracefully...');
  //   await app.close();
  //   process.exit(0);
  // });

  await app.listen(port);
  logger.log(`Server is running on http://localhost:${port}`);
}

bootstrap();
