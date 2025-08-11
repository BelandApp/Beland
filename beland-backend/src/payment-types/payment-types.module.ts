import { Module } from '@nestjs/common';
import { PaymentTypesService } from './payment-types.service';
import { PaymentTypesController } from './payment-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentType } from './entities/payment-type.entity';
import { PaymentTypesRepository } from './payment-types.repository';

@Module({
  imports:[TypeOrmModule.forFeature([PaymentType])],
  controllers: [PaymentTypesController],
  providers: [PaymentTypesService, PaymentTypesRepository],
})
export class PaymentTypesModule {}
