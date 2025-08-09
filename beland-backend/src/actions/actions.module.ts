import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { ActionsRepository } from './actions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Action])],
  controllers: [ActionsController],
  providers: [ActionsService, ActionsRepository],
})
export class ActionsModule {}
