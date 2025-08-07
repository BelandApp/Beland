import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { DataSeederService } from './data-seeder.service';
import { RolesRepository } from 'src/roles/roles.repository';

@Module({
  imports: [RolesModule, UsersModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
