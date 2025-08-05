// payphone/payphone.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayphoneWebhookController } from './webhook/webhook.controller'; 
import { WebhookService } from './webhook/webhook.service';
import { PayphoneWebhookGuard } from './webhook/guard/webhook.guard';
import { WalletsModule } from 'src/wallets/wallets.module';
import { PayphoneService } from './payphone.service';
import { HttpModule } from '@nestjs/axios';
import { WalletsService } from 'src/wallets/wallets.service';
import { WalletsRepository } from 'src/wallets/wallets.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { PaymentMethod } from 'src/payment_methods/entities/payment_method.entity';
import { TransactionType } from 'src/transaction-type/entities/transaction-type.entity';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Wallet, Transaction, PaymentMethod, TransactionType])],
  controllers: [PayphoneWebhookController],
  providers: [WebhookService, PayphoneWebhookGuard, PayphoneService, WalletsService, WalletsRepository],
})
export class PayphoneModule {}