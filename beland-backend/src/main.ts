// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { RequestLoggerMiddleware } from './middlleware/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : (['debug', 'log', 'warn', 'error', 'verbose'] as LogLevel[]),
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.use(RequestLoggerMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

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
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(`✅ Beland API corriendo en: ${await app.getUrl()}`, 'BelandAPI');
  Logger.log(
    `📘 Swagger disponible en: ${await app.getUrl()}/api/docs`,
    'Swagger',
  );
}

void bootstrap();
