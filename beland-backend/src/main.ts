import * as crypto from 'crypto';

// Polyfill para crypto.subtle si no está disponible (ej. en algunos entornos Node)
if (!(globalThis as any).crypto?.subtle) {
  (globalThis as any).crypto = crypto.webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, raw } from 'express';
import { ConfigService } from '@nestjs/config';

// Importar los middlewares de seguridad.
// Se corrige la importación de compression y rateLimit para que sean directamente invocables como funciones.
import compression from 'compression'; // Corrección aquí: importación por defecto
import helmet from 'helmet'; // Correcto, helmet suele ser importación por defecto
import rateLimit from 'express-rate-limit'; // Corrección aquí: importación por defecto

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Configuración del logger basada en el entorno
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : (['debug', 'log', 'warn', 'error', 'verbose'] as LogLevel[]),
  });

  const configService = app.get(ConfigService);
  const appLogger = new Logger('main.ts'); // Usar un logger específico para main.ts

  // --- Seguridad y Middleware ---
  // Helmet para seguridad de cabeceras HTTP
  app.use(helmet());
  // Compresión de respuestas para mejorar el rendimiento
  app.use(compression());
  // Limitador de tasa para prevenir ataques de fuerza bruta
  app.use(
    rateLimit({
      // Ahora 'rateLimit' es directamente invocable como una función
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: configService.get<number>('THROTTLE_LIMIT') || 100, // Máximo 100 solicitudes por IP en 15 minutos
      message:
        'Demasiadas solicitudes desde esta IP, por favor intente de nuevo después de 15 minutos.',
    }),
  );

  // Prefijo global para todas las rutas de la API
  app.setGlobalPrefix('api');
  // Filtro global para manejar excepciones HTTP
  app.useGlobalFilters(new HttpExceptionFilter());
  // Pipes de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas (CORREGIDO EL TYPO)
      transform: true, // Transforma payloads a instancias de DTOs
      transformOptions: {
        enableImplicitConversion: true, // Intenta convertir tipos básicos
      },
    }),
  );

  // --- Configuración de CORS dinámica ---
  const isProduction = process.env.NODE_ENV === 'production';

  // URLs de la API
  const apiUrlLocal = configService.get<string>('API_URL_LOCAL');
  const apiUrlProd = configService.get<string>('API_URL_PROD');

  // URLs de la Aplicación Principal de Beland
  const appMainUrlLocal = configService.get<string>('APP_MAIN_URL_LOCAL');
  const appMainUrlProd = configService.get<string>('APP_MAIN_URL_PROD');

  // URLs de la Landing Page
  const appLandingUrlLocal = configService.get<string>('APP_LANDING_URL_LOCAL');
  const appLandingUrlProd = configService.get<string>('APP_LANDING_URL_PROD');

  // Orígenes adicionales definidos en .env
  const additionalOrigins =
    (isProduction
      ? configService.get<string>('CORS_ADDITIONAL_ORIGINS_PROD')
      : configService.get<string>('CORS_ADDITIONAL_ORIGINS_LOCAL')
    )
      ?.split(',')
      .map((url) => url.trim())
      .filter(Boolean) || [];

  // Orígenes base permitidos, incluyendo las variantes de localhost IPv4 e IPv6
  const baseOrigins: (string | RegExp)[] = [
    // Se define el tipo para incluir RegExp
    isProduction ? appMainUrlProd : appMainUrlLocal,
    isProduction ? appLandingUrlProd : appLandingUrlLocal,
    apiUrlLocal, // Siempre incluir localhost del backend para Swagger y pruebas
    'http://localhost:3001', // Añadir explícitamente localhost sin /api
    'http://[::1]:3001', // Añadir explícitamente la dirección IPv6 de localhost
    'http://[::1]:3001/api', // También la versión IPv6 con /api
    configService.get<string>('AUTH0_AUDIENCE'), // Puede ser necesario como origen
    'https://auth.expo.io/@beland/Beland', // Para Expo Go
    'belandnative://redirect', // Para Expo Development Build y esquemas personalizados
    // Añadir patrones de wildcard para Expo en desarrollo si son necesarios
    /https:\/\/\w+\-beland\-\d+\.exp\.direct$/,
    /https:\/\/\w+\-anonymous\-\d+\.exp\.direct$/,
  ].filter(Boolean); // Filtrar valores nulos o indefinidos

  // Combinar orígenes base y adicionales
  const corsOrigins = [...baseOrigins, ...additionalOrigins];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (por ejemplo, desde Postman o CURL)
      if (!origin) {
        appLogger.debug(`CORS: Origen no proporcionado, permitiendo acceso.`);
        return callback(null, true);
      }

      // Comprobar si el origen coincide con alguno de los permitidos (incluyendo wildcards y regex)
      const allowed = corsOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string' && allowedOrigin.includes('*')) {
          // Convertir el patrón de wildcard a una expresión regular
          const regex = new RegExp(`^${allowedOrigin.replace(/\*/g, '.*')}$`);
          return regex.test(origin);
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      if (allowed) {
        appLogger.debug(`CORS: Origen "${origin}" permitido.`);
        callback(null, true);
      } else {
        appLogger.warn(
          `CORS: Origen "${origin}" NO permitido por la política CORS. Orígenes configurados: ${corsOrigins
            .map((o) => (o instanceof RegExp ? o.source : o))
            .join(', ')}`,
        );
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  appLogger.log(
    `CORS permitidos (resolución final): ${corsOrigins
      .map((o) => (o instanceof RegExp ? o.source : o))
      .join(', ')}`, // Mostrar patrones regex
  );
  // --- Fin Configuración de CORS dinámica ---

  // Configuración de Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      displayRequestDuration: true,
      filter: true,
      operationsSorter: 'alpha',
    },
  });

  // Middleware para parsear JSON y raw (para webhooks)
  app.use(json());
  app.use('/webhook/payphone', raw({ type: 'application/json' }));

  // Inicio de la aplicación en el puerto configurado
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);

  appLogger.log(`✅ Beland API corriendo en: http://localhost:${port}`); // Usar localhost para mayor consistencia en el log
  appLogger.log(`📘 Swagger disponible en: http://localhost:${port}/api/docs`);
}

void bootstrap();
