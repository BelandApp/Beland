import * as crypto from 'crypto';

// Solo si crypto no existe o no tiene "subtle"
if (!(globalThis as any).crypto?.subtle) {
  (globalThis as any).crypto = crypto.webcrypto;
}

import { NestFactory, AbstractHttpAdapter } from '@nestjs/core'; // Importar AbstractHttpAdapter
import { AppModule } from './app.module';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, raw } from 'express';
import { ConfigService } from '@nestjs/config'; // Importar ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : (['debug', 'log', 'warn', 'error', 'verbose'] as LogLevel[]),
  });

  // Obtener ConfigService para acceder a las variables de entorno
  const configService = app.get(ConfigService);

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

  // Configuración de CORS
  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://beland.app',
    'https://*-beland-8081.exp.direct', // Ajustado para un posible comodín
    'http://localhost:8081', // Asegúrate de incluir el puerto de tu frontend
    'https://auth.expo.io/@beland/Beland',
    'belandnative://redirect',
    'https://eoy0nfm-beland-8081.exp.direct',
    'https://nl6egxw-anonymous-8081.exp.direct',
    'https://zef_jly-anonymous-8081.exp.direct',
    // Puedes añadir el dominio de tu backend si el frontend hace peticiones directamente a él,
    // aunque no suele ser el caso para peticiones desde el frontend al mismo backend
    configService.get<string>('AUTH0_AUDIENCE'), // Incluye la audiencia de Auth0 si es un origen válido para tu frontend
  ].filter(Boolean); // Filtra cualquier valor nulo o indefinido

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  Logger.log(`CORS permitidos: ${corsOrigins.join(', ')}`, 'main.ts');

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
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none', // <--- Esto contrae todo por defecto
      displayRequestDuration: true,
      filter: true,
      operationsSorter: 'alpha',
    },
  });

  // Middleware para parsear JSON normal en todas las rutas excepto webhooks
  app.use(json());

  // Middleware para exponer rawBody SOLO en /webhook/payphone
  app.use('/webhook/payphone', raw({ type: 'application/json' }));

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);

  Logger.log(`✅ Beland API corriendo en: ${await app.getUrl()}`, 'BelandAPI');
  Logger.log(
    `📘 Swagger disponible en: ${await app.getUrl()}/api/docs`,
    'Swagger',
  );
}

void bootstrap();
