// src/testimonies/testimony.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimony } from './entities/testimony.entity';
import { TestimonyRepository } from './testimony.repository';
import { UsersModule } from 'src/users/users.module'; // Importa UsersModule para UsersService
import { User } from 'src/users/entities/users.entity'; // Importa User para TypeOrmModule.forFeature
import { TestimoniesController } from './testimonies.controller';
import { TestimoniesService } from './testimonies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimony, User]), // Registra la entidad Testimony y User
    forwardRef(() => UsersModule), // Para resolver dependencias circulares con UsersModule
  ],
  controllers: [TestimoniesController],
  providers: [TestimoniesService, TestimonyRepository],
  exports: [TestimoniesService, TestimonyRepository, TypeOrmModule], // Exporta para que otros módulos puedan usarlos
})
export class TestimoniesModule {}
