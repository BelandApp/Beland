import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment_methods.service';
import { PaymentMethodsController } from './payment_methods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment_method.entity';
import { PaymentMethodsRepository } from './payment_methods.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, PaymentMethodsRepository],
})
export class PaymentMethodsModule {}
