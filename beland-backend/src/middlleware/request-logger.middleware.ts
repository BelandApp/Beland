// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    const authorizationHeader =
      req.get('authorization') || 'No Authorization Header provided';

    const start = process.hrtime.bigint(); // Iniciar contador de tiempo

    this.logger.log(
      `--> ${method} ${originalUrl} | IP: ${ip} | User-Agent: ${userAgent} | Auth: ${authorizationHeader.substring(0, 50)}...`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const end = process.hrtime.bigint(); // Finalizar contador de tiempo
      const durationMs = Number(end - start) / 1_000_000; // Convertir a milisegundos

      this.logger.log(
        `<-- ${method} ${originalUrl} | Status: ${statusCode} | Duration: ${durationMs.toFixed(2)}ms`,
      );
    });

    next();
  }
}
