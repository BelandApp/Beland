import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log(
        '✅ Conexión a la base de datos establecida correctamente.',
      );
    } else {
      this.logger.error(
        '❌ La conexión a la base de datos no se ha inicializado.',
      );
    }
  }
}
