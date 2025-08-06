// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, raw } from 'express';
// import { RequestLoggerMiddleware } from './middleware/request-logger.middleware'; // Nombre corregido 'middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : (['debug', 'log', 'warn', 'error', 'verbose'] as LogLevel[]),
  });

  // Prefijo global API
  app.setGlobalPrefix('api');

  // Filtro global para excepciones HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  // Validaciones globales: Seguridad, conversión y limpieza de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no declaradas en DTO
      forbidNonWhitelisted: true, // Lanza error si hay extra props
      transform: true, // Convierte strings de query a int, etc
      transformOptions: {
        enableImplicitConversion: true, // permite @Type(() => Number) y cast automático
      },
    }),
  );

  // CORS para dominios permitidos
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://beland.app',
      'https://api.beland.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Beland API')
    .setDescription('Documentación de la API para la aplicación Beland')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT (Bearer Token)',
        in: 'header',
      },
      'JWT-auth', // <--- usa exactamente este nombre en @ApiBearerAuth() en controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Middleware para parsear JSON normal en todas las rutas excepto webhooks
  app.use(json());

  // Middleware para exponer rawBody SOLO en /webhook/payphone
  app.use('/webhook/payphone', raw({ type: 'application/json' }));

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(`✅ Beland API corriendo en: ${await app.getUrl()}`, 'BelandAPI');
  Logger.log(
    `📘 Swagger disponible en: ${await app.getUrl()}/api/docs`,
    'Swagger',
  );
}

void bootstrap();
