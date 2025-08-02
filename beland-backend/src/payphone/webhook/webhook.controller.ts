// payphone/webhook.controller.ts
import { Controller, Post, Req, HttpCode, UseGuards } from '@nestjs/common';
import { PayphoneWebhookGuard } from './guard/webhook.guard';
import { WebhookService } from './webhook.service';

@Controller('webhook/payphone')
export class PayphoneWebhookController {
  constructor(private readonly webhookSvc: WebhookService) {}

  @Post()
  @HttpCode(200) // devuelve 200 OK para evitar reintentos
  @UseGuards(PayphoneWebhookGuard)
  async handle(@Req() req: any) {
    // req.body es Buffer raw, parseamos:
    const event = JSON.parse(req.body.toString('utf8'));
    await this.webhookSvc.processEvent(event);
  }
}