// payphone/payphone.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayphoneWebhookController } from './webhook/webhook.controller'; 
import { WebhookService } from './webhook/webhook.service';
import { PayphoneWebhookGuard } from './webhook/guard/webhook.guard';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [ConfigModule, WalletsModule],
  controllers: [PayphoneWebhookController],
  providers: [WebhookService, PayphoneWebhookGuard],
})
export class PayphoneModule {}