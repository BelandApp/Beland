import { Module } from '@nestjs/common';
import { AmountToPaymentsService } from './amount-to-payment.service';
import { AmountToPaymentsController } from './amount-to-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmountToPayment } from './entities/amount-to-payment.entity';
import { AmountToPaymentsRepository } from './amount-to-payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AmountToPayment])],
  controllers: [AmountToPaymentsController],
  providers: [AmountToPaymentsService, AmountToPaymentsRepository],
})
export class AmountToPaymentModule {}
