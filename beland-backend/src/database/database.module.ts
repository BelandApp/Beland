import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DataSeederService } from './data-seeder.service';
import { RolesModule } from 'src/roles/roles.module'; // Necesario para DataSeederService
import { UsersModule } from 'src/users/users.module'; // Necesario para DataSeederService (si fuera a sembrar usuarios, aunque ahora no lo hace)
// Eliminada la importación de SettingsModule, ya que no se usa o no existe en el contexto actual.

@Module({
  imports: [
    RolesModule, // DataSeederService necesita RolesRepository
    UsersModule, // Se mantiene por si hay otras dependencias cruzadas en el futuro
  ],
  providers: [DatabaseService, DataSeederService],
  exports: [DatabaseService, DataSeederService],
})
export class DatabaseModule {}
